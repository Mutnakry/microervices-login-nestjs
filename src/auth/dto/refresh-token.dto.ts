import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: '6bf46a86-86fd-4ae3-a2ab-9c9d7676515b',
    description: 'The user ID tied to the refresh token',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The refresh token previously issued at login',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
