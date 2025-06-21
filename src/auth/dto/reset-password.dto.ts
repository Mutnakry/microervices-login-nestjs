// dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'some-random-reset-token' })
  token: string;

  @ApiProperty({ example: 'newStrongPassword!' })
  newPassword: string;
}
