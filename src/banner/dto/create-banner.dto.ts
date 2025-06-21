// src/banner/dto/create-banner.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, IsBoolean } from 'class-validator';

export class CreateBannerDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsUrl()
  imageUrl: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
