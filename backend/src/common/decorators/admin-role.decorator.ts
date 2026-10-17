import { SetMetadata } from '@nestjs/common';

export const ADMIN_ROLE_KEY = 'adminRole';

export const AdminRole = (role?: string) => SetMetadata(ADMIN_ROLE_KEY, role);
