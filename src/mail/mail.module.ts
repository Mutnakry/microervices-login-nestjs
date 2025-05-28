// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
@Module({
    providers: [MailService],
    exports: [MailService], // ✅ Export for use in other modules
})
export class MailModule { }
