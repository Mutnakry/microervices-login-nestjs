import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginOtpStartDto } from './dto/login-otp-start.dto';
import { LoginOtpVerifyDto } from './dto/login-otp-verify.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Email already exists' })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('devices')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all active devices/sessions' })
  getDevices(@Req() req) {
    return this.authService.getDevices(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('devices/revoke')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Revoke a specific device/session' })
  revokeDevice(@Req() req, @Body('sessionId') sessionId: string) {
    return this.authService.revokeSession(req.user.id, sessionId);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto, @Req() req: Request) {
    return this.authService.login(body.email, body.password, req); // ✅ pass req
  }
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.sendResetLink(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('login-otp-start')
  async startOtpLogin(@Body() dto: LoginOtpStartDto) {
    return this.authService.loginOtpStart(dto.email, dto.password);
  }

  @Post('login-otp-verify')
  async verifyOtpLogin(@Body() dto: LoginOtpVerifyDto) {
    return this.authService.loginOtpVerify(dto.email, dto.otp);
  }

  // 🔐 Google OAuth endpoints
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() { }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleLoginRedirect(@Req() req) {
    return this.authService.socialLogin(req.user);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin() {
    // Facebook redirects to /facebook/redirect
  }

  @Get('facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookRedirect(@Req() req) {
    return this.authService.socialLogin(req.user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  logout(@Req() req) {
    return this.authService.logout(req.user.id);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 400, description: 'Missing or invalid payload' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token or expired' })
  async refresh(@Body() body: RefreshTokenDto) {
    const { userId, refreshToken } = body;

    if (!userId || !refreshToken) {
      throw new BadRequestException('userId and refreshToken are required');
    }

    return this.authService.refreshTokens(userId, refreshToken);
  }


  @Post('verify-email')
  @UseGuards(JwtAuthGuard) // protect this route, must be logged in
  async sendEmailVerify(@Req() req) {
    return this.authService.sendEmailVerification(req.user.id);
  }

  @Get('confirm-email')
  async confirmEmail(@Query('token') token: string) {
    return this.authService.confirmEmail(token);
  }


  @Post('enable-mfa')
  @UseGuards(JwtAuthGuard)
  enableMfa(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.authService.enableMfa(user.id);
  }

  @Post('verify-mfa')
  @UseGuards(JwtAuthGuard)
  verifyMfa(@Req() req: Request, @Body('token') token: string) {
    const user = req.user as { id: string };
    return this.authService.verifyMfa(user.id, token);
  }
}
