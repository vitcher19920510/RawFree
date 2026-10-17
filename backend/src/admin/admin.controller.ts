import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { AdminService } from './admin.service';

@Controller('api/v1/admin')
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== USERS ====================

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(
      parseInt(page || '1'),
      parseInt(limit || '50'),
      status,
      search,
    );
  }

  @Get('users/:id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    return this.adminService.softDeleteUser(id);
  }

  // ==================== SUBSCRIPTIONS ====================

  @Post('subscriptions/grant')
  @HttpCode(HttpStatus.OK)
  async grantSubscription(
    @Body('userId') userId: string,
    @Body('days') days: number,
  ) {
    return this.adminService.grantSubscription(userId, days);
  }

  // ==================== STATS ====================

  @Get('stats/overview')
  @HttpCode(HttpStatus.OK)
  async getStatsOverview() {
    return this.adminService.getStatsOverview();
  }

  // ==================== REPORTS ====================

  @Get('reports')
  @HttpCode(HttpStatus.OK)
  async getReports(@Query('status') status?: string) {
    return this.adminService.getReports(status);
  }

  @Patch('reports/:id')
  @HttpCode(HttpStatus.OK)
  async updateReportStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateReportStatus(id, status);
  }

  // ==================== AUDIT ====================

  @Get('audit')
  @HttpCode(HttpStatus.OK)
  async getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAuditLogs(
      parseInt(page || '1'),
      parseInt(limit || '50'),
    );
  }

  // ==================== CLIENT ERRORS ====================

  @Get('client-errors')
  @HttpCode(HttpStatus.OK)
  async getClientErrors(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getClientErrors(
      parseInt(page || '1'),
      parseInt(limit || '50'),
    );
  }

  // ==================== LEGAL DOCS ====================

  @Get('legal')
  @HttpCode(HttpStatus.OK)
  async getLegalDocs() {
    return this.adminService.getLegalDocs();
  }

  @Post('legal')
  @HttpCode(HttpStatus.CREATED)
  async createLegalDoc(
    @Body('code') code: string,
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('version') version: string,
  ) {
    return this.adminService.createLegalDoc(code, title, body, version);
  }

  @Patch('legal/:id')
  @HttpCode(HttpStatus.OK)
  async updateLegalDoc(
    @Param('id') id: string,
    @Body('title') title?: string,
    @Body('body') body?: string,
    @Body('version') version?: string,
  ) {
    return this.adminService.updateLegalDoc(id, title, body, version);
  }
}
