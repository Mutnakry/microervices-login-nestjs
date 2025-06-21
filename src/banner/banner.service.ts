// src/banner/banner.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.BannerCreateInput) {
    return this.prisma.banner.create({ data });
  }

  findAll() {
    return this.prisma.banner.findMany();
  }

  findOne(id: string) {
    return this.prisma.banner.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.BannerUpdateInput) {
    return this.prisma.banner.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }
}
