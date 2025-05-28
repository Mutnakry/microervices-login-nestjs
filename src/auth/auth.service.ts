

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

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

  // Normal JWT login
  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
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
}
