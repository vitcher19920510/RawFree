import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FeedService } from './feed.service';
import { FeedActionDto } from './dto/feed-action.dto';
import { FeedQueryDto } from './dto/feed-query.dto';

@Controller('api/v1/feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getFeed(@Request() req: any, @Query() query: FeedQueryDto) {
    return this.feedService.getFeed(req.user.sub, query.page, query.limit);
  }

  @Post('like')
  @HttpCode(HttpStatus.OK)
  async like(@Request() req: any, @Body() dto: FeedActionDto) {
    return this.feedService.like(req.user.sub, dto);
  }

  @Post('skip')
  @HttpCode(HttpStatus.OK)
  async skip(@Request() req: any, @Body() dto: FeedActionDto) {
    return this.feedService.skip(req.user.sub, dto);
  }

  @Post('superlike')
  @HttpCode(HttpStatus.OK)
  async superlike(@Request() req: any, @Body() dto: FeedActionDto) {
    return this.feedService.superlike(req.user.sub, dto);
  }
}
