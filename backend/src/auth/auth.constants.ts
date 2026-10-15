import * as argon2 from 'argon2';

export const AUTH_CONSTANTS = {
  SMS_CODE_TTL_SEC: 300,          // 5 минут
  EMAIL_CODE_TTL_SEC: 900,        // 15 минут
  RECOVERY_TOKEN_TTL_SEC: 3600,   // 1 час
  MAX_VERIFY_ATTEMPTS: 5,
  MAX_SMS_PER_HOUR: 3,
  MAX_EMAIL_PER_HOUR: 5,
  ACCESS_TOKEN_TTL_SEC: 900,     // 15 минут в секундах
  REFRESH_TOKEN_TTL_SEC: 2592000, // 30 дней в секундах
  ARGON2_OPTIONS: {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 1,    // Снижено до 1 для предотвращения OOM на VPS хостинге
  },
};
