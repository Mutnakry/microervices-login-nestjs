import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
  async createUser(data: { email: string, password: string, first_name: string, last_name: string }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password, // ALREADY hashed
        first_name: data.first_name,
        last_name: data.last_name,
        role: 'USER',
        balance: 0,
      }
    });
  }
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async updateUser(id: string, data: Partial<any>) {
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

}
