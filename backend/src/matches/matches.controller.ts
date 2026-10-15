import { Controller, Get, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MatchesService } from './matches.service';

@Controller('api/v1/matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  /**
   * GET /api/v1/matches
   * Успех: 200 OK — получить список взаимных совпадений
   * Ошибки: 401 Unauthorized, 500 Internal Error
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMatches(@Request() req: any) {
    return this.matchesService.getMatches(req.user.sub);
  }
}
