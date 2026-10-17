import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('api/v1/admin/auth')
export class AdminAuthController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AdminLoginDto) {
    return this.adminService.adminLogin(dto);
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMe(@Request() req: any) {
    return {
      id: req.admin.sub,
      role: req.admin.role,
    };
  }
}
