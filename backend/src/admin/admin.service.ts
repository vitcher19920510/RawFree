import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ==================== AUTH ====================

  async adminLogin(dto: AdminLoginDto) {
    const admin = await this.prisma.adminUser.findFirst({
      where: { login: dto.login },
    });

    if (!admin) {
      throw new BadRequestException('Неверный логин или пароль');
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new BadRequestException('Аккаунт временно заблокирован');
    }

    const passwordValid = await argon2.verify(admin.passwordHash, dto.password);
    if (!passwordValid) {
      await this.prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          failedAttempts: { increment: 1 },
          lockedUntil: admin.failedAttempts >= 4 ? new Date(Date.now() + 30 * 60 * 1000) : null,
        },
      });
      throw new BadRequestException('Неверный логин или пароль');
    }

    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    if (admin.totpSecret && !dto.otpCode) {
      return { requiresOtp: true, message: 'Введите код 2FA' };
    }

    if (admin.totpSecret && dto.otpCode) {
      if (!dto.otpCode || dto.otpCode.length !== 6 || !/^\d+$/.test(dto.otpCode)) {
        throw new BadRequestException('Неверный код подтверждения');
      }
    }

    const payload = { sub: admin.id, login: admin.login, role: admin.role, type: 'admin' };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    await this.prisma.adminAudit.create({
      data: {
        adminId: admin.id,
        action: 'LOGIN',
        targetType: 'ADMIN',
        targetId: admin.id,
        ip: '',
        userAgent: '',
      },
    });

    return { accessToken };
  }

  // ==================== USERS ====================

  async getUsers(page: number = 1, limit: number = 50, status?: string, search?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { profile: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status === 'active') {
      where.subscriptions = {
        some: { status: 'ACTIVE', expiresAt: { gt: new Date() } },
      };
    } else if (status === 'expired') {
      where.subscriptions = {
        some: { status: 'EXPIRED' },
      };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          profile: true,
          subscriptions: {
            where: { status: 'ACTIVE' },
            orderBy: { startedAt: 'desc' },
            take: 1,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u: any) => ({
        id: u.id,
        email: u.email,
        phone: u.phone,
        name: u.profile?.name,
        city: u.profile?.city,
        isDeleted: !!u.deletedAt,
        createdAt: u.createdAt,
        subscription: u.subscriptions[0]
          ? { status: u.subscriptions[0].status, expiresAt: u.subscriptions[0].expiresAt }
          : null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        photos: { orderBy: { order: 'asc' } },
        subscriptions: { orderBy: { startedAt: 'desc' } },
        blockedSent: { include: { blockedUser: { select: { id: true, email: true } } } },
        reportsSent: true,
        reportsRecv: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const u = user as any;
    return {
      id: u.id,
      email: u.email,
      phone: u.phone,
      is18: u.is18,
      isEmailVerified: !!u.emailVerifiedAt,
      isDeleted: !!u.deletedAt,
      createdAt: u.createdAt,
      profile: u.profile,
      photos: u.photos,
      subscriptions: u.subscriptions,
      blockedUsers: u.blockedSent?.map((b: any) => ({ id: b.blockedUser.id, email: b.blockedUser.email })) || [],
      reportsMade: u.reportsSent?.length || 0,
      reportsAgainst: u.reportsRecv?.length || 0,
    };
  }

  async softDeleteUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  // ==================== SUBSCRIPTIONS ====================

  async grantSubscription(userId: string, days: number) {
    const expiresAt = new Date(Date.now() + days * 86400000);

    await this.prisma.subscription.create({
      data: {
        userId,
        plan: 'admin_grant',
        priceCents: 0,
        currency: 'RUB',
        platform: 'ADMIN',
        purchaseToken: `admin_grant_${Date.now()}`,
        status: 'ACTIVE',
        autoRenew: false,
        expiresAt,
      },
    });

    return { success: true, expiresAt };
  }

  // ==================== STATS ====================

  async getStatsOverview() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      newToday,
      newThisWeek,
      newThisMonth,
      activeSubscriptions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.subscription.count({
        where: { status: 'ACTIVE', expiresAt: { gt: now } },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      newToday,
      newThisWeek,
      newThisMonth,
      activeSubscriptions,
      conversionRate: totalUsers > 0 ? ((activeSubscriptions / totalUsers) * 100).toFixed(1) : '0',
    };
  }

  // ==================== REPORTS ====================

  async getReports(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const reports = await this.prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, email: true, profile: { select: { name: true } } } },
        reported: { select: { id: true, email: true, profile: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reports.map((r: any) => ({
      id: r.id,
      fromUser: { id: r.reporter.id, email: r.reporter.email, name: r.reporter.profile?.name },
      toUser: { id: r.reported.id, email: r.reported.email, name: r.reported.profile?.name },
      reason: r.reason,
      comment: r.comment,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }

  async updateReportStatus(reportId: string, status: string) {
    const report = await this.prisma.report.update({
      where: { id: reportId },
      data: { status },
    });
    return { success: true, status: report.status };
  }

  // ==================== AUDIT ====================

  async getAuditLogs(page: number = 1, limit: number = 50) {
    const [logs, total] = await Promise.all([
      this.prisma.adminAudit.findMany({
        include: {
          admin: { select: { id: true, login: true, role: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.adminAudit.count(),
    ]);

    return {
      data: logs.map((l: any) => ({
        id: l.id,
        adminId: l.adminId,
        admin: l.admin,
        action: l.action,
        targetType: l.targetType,
        targetId: l.targetId,
        reason: l.reason,
        ip: l.ip,
        createdAt: l.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ==================== CLIENT ERRORS ====================

  async getClientErrors(page: number = 1, limit: number = 50) {
    const [errors, total] = await Promise.all([
      this.prisma.clientError.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.clientError.count(),
    ]);

    return {
      data: errors,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ==================== LEGAL DOCS ====================

  async getLegalDocs() {
    return this.prisma.legalDoc.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async createLegalDoc(code: string, title: string, body: string, version: string) {
    return this.prisma.legalDoc.create({
      data: { code, title, body, version },
    });
  }

  async updateLegalDoc(id: string, title?: string, body?: string, version?: string) {
    return this.prisma.legalDoc.update({
      where: { id },
      data: { title, body, version },
    });
  }
}
