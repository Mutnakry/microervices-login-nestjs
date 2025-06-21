// dto/auth.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  password: string;

  @ApiProperty({ example: 'Jane' })
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  last_name: string;
}

export class LoginDto {
  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  password: string;
}
