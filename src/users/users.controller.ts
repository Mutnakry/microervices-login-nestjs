// // users.controller.ts
// import { Controller, Get, UseGuards, Req } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Controller('users')
// export class UsersController {  // ✅ Now matches the module import
//   @UseGuards(AuthGuard('jwt'))
//   @Get()
//   getProfile(@Req() req) {
//     return req.user;
//   }
// }

import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('users')
@ApiBearerAuth() // Enables the "Authorize" button in Swagger
@Controller('users')
export class UsersController {
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the currently authenticated user' })
  getProfile(@Req() req: any) {
    return req.user; // populated by JwtStrategy.validate()
  }
}
