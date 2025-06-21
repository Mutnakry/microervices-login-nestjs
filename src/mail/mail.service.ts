// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendOtpEmail(to: string, otp: string) {
    const from = this.configService.get('EMAIL_FROM');

    await this.transporter.sendMail({
      from,
      to,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
      html: `<h2>OTP Verification</h2><p>Your OTP code is: <strong>${otp}</strong></p>`,
    });

    console.log(`✅ OTP email sent to ${to}`);
  }
   async sendVerificationEmail(email: string, link: string) {
    console.log(`📧 Sending verification email to ${email}`);
    console.log(`🔗 Link: ${link}`);
  }
}
