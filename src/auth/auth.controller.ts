// import { Controller, Post, Body } from '@nestjs/common';
// import { AuthService } from './auth.service';

// @Controller('auth')
// export class AuthController {
//   constructor(private authService: AuthService) {}

//   @Post('register')
//   register(@Body() body: any) {
//     return this.authService.register(body);
//   }

//   @Post('login')
//   login(@Body() body: any) {
//     return this.authService.login(body.email, body.password);
//   }
// }


import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { LoginOtpStartDto } from './dto/login-otp-start.dto'
import { LoginOtpVerifyDto } from './dto/login-otp-verify.dto'
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

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  // auth.controller.ts
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

}
