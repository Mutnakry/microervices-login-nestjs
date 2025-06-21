// src/seo/seo.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateSeoDto } from './dto/create-seo.dto';

@Injectable()
export class SeoService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSeoDto) {
    try {
      return await this.prisma.seoTenantID.create({
        data: {
          page: dto.page,
          title: dto.title,
          description: dto.description,
          keywords: dto.keywords,
          tenant: {
            connect: { id: dto.tenantId },
          },
        },
      });
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new BadRequestException('Invalid tenantId: Tenant does not exist.');
      }
      throw err;
    }
  }

  findAll() {
    return this.prisma.seoTenantID.findMany();
  }

  async findOne(id: string) {
    const result = await this.prisma.seoTenantID.findUnique({ where: { id } });
    if (!result) {
      throw new NotFoundException(`SEO config with id ${id} not found`);
    }
    return result;
  }

  async update(id: string, data: Prisma.SeoTenantIDUpdateInput) {
    try {
      return await this.prisma.seoTenantID.update({ where: { id }, data });
    } catch (err) {
      throw new NotFoundException(`Cannot update: SEO config with id ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.seoTenantID.delete({ where: { id } });
    } catch (err) {
      throw new NotFoundException(`Cannot delete: SEO config with id ${id} not found`);
    }
  }
}
