// src/session/session.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async createSession(userId: string, req: Request) {
    const ip = this.getClientIp(req);
    const userAgent = req.get('User-Agent') || 'unknown';

    return this.prisma.session.create({
      data: {
        userId,
        ipAddress: ip,
        userAgent,
      },
    });
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0];
    }
    return req.ip || req.connection?.remoteAddress || 'unknown';
  }
}
