

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { Request } from 'express';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService
  ) { }

  // Validate email/password
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }
  // Get all active sessions for the user
  async getDevices(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, revoked: false },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  // Revoke a session by session ID
  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
        revoked: false,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found or already revoked');
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revoked: true },
    });

    return { message: 'Session revoked successfully' };
  }
  // Log session on login
  async login(email: string, password: string, req?: Request) {
    const user = await this.validateUser(email, password);

    // If MFA is enabled, require OTP verification first
    if (user.mfaSecret) {
      return {
        requiresMfa: true,
        message: 'MFA is enabled. Please verify using your TOTP code.',
      };
    }

    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    const hashed = await bcrypt.hash(refresh_token, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashed },
    });

    // ✅ Extract and normalize IP
    let rawIp =
      (req?.headers['x-forwarded-for'] as string) ||
      req?.ip ||
      req?.connection?.remoteAddress ||
      'unknown';
    if (rawIp === '::1') rawIp = '127.0.0.1';

    const userAgent = req?.headers['user-agent'] || 'unknown';

    await this.prisma.session.create({
      data: {
        userId: user.id,
        ipAddress: rawIp,
        userAgent,
      },
    });

    return { access_token, refresh_token, user };
  }

  async verifyMfaLogin(email: string, otp: string, req?: Request) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException('MFA not enabled');
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: otp,
      window: 1,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    const hashed = await bcrypt.hash(refresh_token, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashed },
    });

    let rawIp =
      (req?.headers['x-forwarded-for'] as string) ||
      req?.ip ||
      req?.connection?.remoteAddress ||
      'unknown';
    if (rawIp === '::1') rawIp = '127.0.0.1';

    const userAgent = req?.headers['user-agent'] || 'unknown';

    await this.prisma.session.create({
      data: {
        userId: user.id,
        ipAddress: rawIp,
        userAgent,
      },
    });

    return { access_token, refresh_token, user };
  }

  // OTP login: step 1 (generate and send OTP)
  async loginOtpStart(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await this.prisma.user.update({
      where: { email },
      data: {
        otpCode: otp,
        otpExpiresAt: expiresAt,
      },
    });

    await this.mailService.sendOtpEmail(email, otp); // ✅ send OTP
    return { message: 'OTP sent to email' };
  }
  // OTP login: step 2 (verify OTP)
  async loginOtpVerify(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      user.otpCode !== otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.prisma.user.update({
      where: { email },
      data: {
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  // Register new user
  async register(data: { email: string, password: string, first_name: string, last_name: string }) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) throw new Error('Email already registered');

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.createUser({ ...data, password: hashed });

    return this.login(user.email, data.password);
  }

  // Send reset password link via email
  async sendResetLink(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Email not found');

    const token = randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    // TODO: Replace with real email logic
    console.log(`🔗 Reset link: http://localhost:3000/reset-password?token=${token}`);

    return { message: 'Reset link sent to email' };
  }

  // Reset password using reset token
  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) throw new Error('Invalid or expired reset token');

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password has been reset' };
  }

  async googleLogin(profile: any) {
    const { email, first_name, last_name } = profile;
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          first_name,
          last_name,
          role: 'user',
          password: 'google-oauth', // dummy password, not used
        },
      });
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  // src/auth/auth.service.ts
  async socialLogin(profile: any) {
    const { email, first_name, last_name } = profile;

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      const fakePassword = await bcrypt.hash(randomBytes(16).toString('hex'), 10);
      user = await this.prisma.user.create({
        data: {
          email,
          first_name,
          last_name,
          password: fakePassword,
          role: 'user',
        },
      });
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }
  
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const valid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!valid) throw new UnauthorizedException();

    const payload = { email: user.email, sub: user.id };
    const newAccess = this.jwtService.sign(payload);
    const newRefresh = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: await bcrypt.hash(newRefresh, 10),
      },
    });

    return {
      access_token: newAccess,
      refresh_token: newRefresh,
    };
  }

  //// verify to email
  async sendEmailVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifyToken: token,
        emailVerifyExpiresAt: expiresAt,
      },
    });

    const link = `http://localhost:4200/auth/confirm-email?token=${token}`;
    await this.mailService.sendVerificationEmail(user.email, link);

    return { message: 'Verification email sent' };
  }
  /// Confirm Verification Email 
  async confirmEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpiresAt: { gt: new Date() },
      },
    });

    if (!user) throw new UnauthorizedException('Invalid or expired token');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiresAt: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  ////Enable MFA for a user
  async enableMfa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const secret = speakeasy.generateSecret({
      name: `MyApp (${user.email})`,
    });

    // Save base32 secret to user
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret.base32 },
    });

    // Generate QR code
    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    return {
      otpauth_url: secret.otpauth_url,
      qrCode: qrCodeDataUrl,
      secret: secret.base32,
    };
  }
  ////Verify TOTP Code
  async verifyMfa(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) throw new UnauthorizedException('MFA not enabled');

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) throw new UnauthorizedException('Invalid OTP');

    return { message: 'MFA verified successfully' };
  }

  async loginWithMfa(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.mfaSecret) throw new UnauthorizedException();

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: otp,
      window: 1,
    });

    if (!verified) throw new UnauthorizedException('Invalid MFA token');

    // issue tokens as usual
    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { access_token, refresh_token, user };
  }

}
