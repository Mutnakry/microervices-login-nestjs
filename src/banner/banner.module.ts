// src/banner/banner.module.ts
import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BannerController],
  providers: [BannerService, PrismaService],
})
export class BannerModule {}
