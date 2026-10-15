export function validateEnv(): void {
  const requiredVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL', 'REDIS_HOST', 'REDIS_PORT', 'PORT'];
  const missing = requiredVars.filter((v) => !process.env[v] || process.env[v]!.trim() === '');

  if (missing.length > 0) {
    throw new Error(`CRITICAL CONFIG ERROR: Missing required environment variables: ${missing.join(', ')}`);
  }
}
