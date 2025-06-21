

// import { Controller, Get, UseGuards, Req } from '@nestjs/common';
// import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
// import { AuthGuard } from '@nestjs/passport';

// @ApiTags('users')
// @ApiBearerAuth() // Enables the "Authorize" button in Swagger
// @Controller('users')
// export class UsersController {
//   @UseGuards(AuthGuard('jwt'))
//   @Get('me')
//   @ApiOperation({ summary: 'Get current user profile' })
//   @ApiResponse({ status: 200, description: 'Returns the currently authenticated user' })
//   getProfile(@Req() req: any) {
//      console.log('Authenticated user:', req.user);
//     return req.user; 
//   }
// }


import { Controller, Get, UseGuards, Req, Patch, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  getMe(@Req() req) {
    console.log('🔐 req.user =', req.user);
    return req.user;
  }
  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Updated user profile' })
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const updatedUser = await this.usersService.updateUser(req.user.userId, dto);
    return updatedUser;
  }

}
