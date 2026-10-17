import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RequireSubscription } from '../common/decorators/require-subscription.decorator';
import { ChatsService } from './chats.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesQueryDto } from './dto/messages-query.dto';

@Controller('api/v1/chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  @RequireSubscription()
  @HttpCode(HttpStatus.OK)
  async getChats(@Request() req: any) {
    return this.chatsService.getChats(req.user.sub);
  }

  @Get(':id/messages')
  @RequireSubscription()
  @HttpCode(HttpStatus.OK)
  async getMessages(
    @Request() req: any,
    @Param('id') chatId: string,
    @Query() query: MessagesQueryDto
  ) {
    return this.chatsService.getMessages(req.user.sub, chatId, query.limit, query.before);
  }

  @Post(':id/messages')
  @RequireSubscription()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Request() req: any,
    @Param('id') chatId: string,
    @Body() dto: SendMessageDto
  ) {
    return this.chatsService.sendMessage(req.user.sub, chatId, dto);
  }
}
