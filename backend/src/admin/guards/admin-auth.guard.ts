import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { ADMIN_ROLE_KEY } from '../../common/decorators/admin-role.decorator';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Отсутствует токен авторизации');
    }

    const token = authHeader.slice(7);

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.type !== 'admin') {
        throw new UnauthorizedException('Недостаточно прав');
      }

      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
        select: { id: true, isActive: true, role: true, failedAttempts: true, lockedUntil: true },
      });

      if (!admin || !admin.isActive) {
        throw new UnauthorizedException('Админ неактивен или не найден');
      }

      if (admin.lockedUntil && admin.lockedUntil > new Date()) {
        throw new UnauthorizedException('Аккаунт заблокирован после неудачных попыток');
      }

      const requiredRole = this.reflector.getAllAndOverride<string>(ADMIN_ROLE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (requiredRole) {
        const roleHierarchy: Record<string, number> = { viewer: 1, support: 2, moderator: 3, superadmin: 4 };
        const userRoleLevel = roleHierarchy[admin.role] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

        if (userRoleLevel < requiredRoleLevel) {
          throw new UnauthorizedException('Недостаточно прав для этого действия');
        }
      }

      request.admin = {
        sub: admin.id,
        role: admin.role,
        type: 'admin',
      };

      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Токен истёк');
      }
      throw new UnauthorizedException('Недействительный токен');
    }
  }
}
