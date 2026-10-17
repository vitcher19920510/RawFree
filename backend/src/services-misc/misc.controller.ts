import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { RequireSubscription } from '../common/decorators/require-subscription.decorator';
import { MiscService } from './misc.service';
import { SendReportDto } from './dto/report.dto';
import { BlockUserDto } from './dto/blocked.dto';
import { UpdateInterestsDto } from './dto/interests.dto';
import { CreateClientErrorDto } from './dto/client-error.dto';

/**
 * Fail-Closed Контроллер: @UseGuards(JwtAuthGuard) применен на уровне ВСЕГО класса.
 * Публичные роуты явно декорированы @Public() для прохождения проверки через Reflector.
 */
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
export class MiscController {
  constructor(private readonly miscService: MiscService) {}

  @Post('incognito')
  @RequireSubscription()
  @HttpCode(HttpStatus.OK)
  async enableIncognito(@Request() req: any) {
    return this.miscService.enableIncognito(req.user.sub);
  }

  @Delete('incognito')
  @RequireSubscription()
  @HttpCode(HttpStatus.OK)
  async disableIncognito(@Request() req: any) {
    return this.miscService.disableIncognito(req.user.sub);
  }

  @Get('blocked')
  @HttpCode(HttpStatus.OK)
  async getBlockedUsers(@Request() req: any) {
    return this.miscService.getBlockedUsers(req.user.sub);
  }

  @Post('blocked')
  @HttpCode(HttpStatus.CREATED)
  async blockUser(@Request() req: any, @Body() dto: BlockUserDto) {
    return this.miscService.blockUser(req.user.sub, dto);
  }

  @Delete('blocked/:id')
  @HttpCode(HttpStatus.OK)
  async unblockUser(@Request() req: any, @Param('id') targetId: string) {
    return this.miscService.unblockUser(req.user.sub, targetId);
  }

  @Post('reports')
  @HttpCode(HttpStatus.CREATED)
  async sendReport(@Request() req: any, @Body() dto: SendReportDto) {
    return this.miscService.sendReport(req.user.sub, dto);
  }

  @Get('interests')
  @HttpCode(HttpStatus.OK)
  async getInterests(@Request() req: any) {
    return this.miscService.getInterests(req.user.sub);
  }

  @Put('interests')
  @HttpCode(HttpStatus.OK)
  async updateInterests(@Request() req: any, @Body() dto: UpdateInterestsDto) {
    return this.miscService.updateInterests(req.user.sub, dto);
  }

  /**
   * GET /api/v1/legal/:code
   * ПУБЛИЧНЫЙ ЭНДПОИНТ (декоратор @Public())
   */
  @Get('legal/:code')
  @Public()
  @HttpCode(HttpStatus.OK)
  async getLegalDoc(@Param('code') code: string) {
    return this.miscService.getLegalDoc(code);
  }

  /**
   * POST /api/v1/client-errors
   * ПУБЛИЧНЫЙ ЭНДПОИНТ (декоратор @Public() — краши отправляются с клиента до логина)
   */
  @Post('client-errors')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async logClientError(@Body() dto: CreateClientErrorDto) {
    return this.miscService.logClientError(dto);
  }
}
