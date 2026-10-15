import { Module } from '@nestjs/common';
//import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    CommonModule],
    //JwtModule.register({
    //  secret: process.env.JWT_SECRET,
    //  signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN as any) ?? '15m' },
    //}),
  //],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
