import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../redis/redis.service';
export declare class JwtAuthGuard implements CanActivate {
    private reflector;
    private jwtService;
    private redisService;
    constructor(reflector: Reflector, jwtService: JwtService, redisService: RedisService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
