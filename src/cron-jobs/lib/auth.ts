export function verifyCronSecret(authHeader: string | null): boolean {
  if (!authHeader) return false;

  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    console.error('CRON_SECRET not configured');
    return false;
  }

  const [type, secret] = authHeader.split(' ');
  return type === 'Bearer' && secret === expectedSecret;
}
