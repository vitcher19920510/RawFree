import { Module } from '@nestjs/common';
import { MiscController } from './misc.controller';
import { MiscService } from './misc.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MiscController],
  providers: [MiscService],
  exports: [MiscService],
})
export class MiscModule {}
