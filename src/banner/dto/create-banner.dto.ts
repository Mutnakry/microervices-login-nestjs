import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUrl, IsBoolean } from 'class-validator';
import { BannerPosition } from '@prisma/client';

export class CreateBannerDto {
  @ApiProperty({ example: 'Homepage Banner' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'https://example.com/banner.jpg' })
  @IsUrl()
  imageUrl: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: BannerPosition, default: BannerPosition.TOP })
  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;
}
