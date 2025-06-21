import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AnnouncementService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.AnnouncementCreateInput) {
    try {
      return await this.prisma.announcement.create({ data });
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2003' &&
        err.meta?.constraint === 'Announcement_tenantId_fkey'
      ) {
        throw new BadRequestException(
          'Invalid tenantId: Tenant does not exist.',
        );
      }
      console.error('Create Announcement Error:', err);
      throw err;
    }
  }

  async findAll() {
    return await this.prisma.announcement.findMany();
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
    return announcement;
  }

  async update(id: string, data: Prisma.AnnouncementUpdateInput) {
    try {
      return await this.prisma.announcement.update({
        where: { id },
        data,
      });
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException(`Cannot update: Announcement ${id} not found`);
      }
      throw err;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.announcement.delete({
        where: { id },
      });
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException(`Cannot delete: Announcement ${id} not found`);
      }
      throw err;
    }
  }
}
