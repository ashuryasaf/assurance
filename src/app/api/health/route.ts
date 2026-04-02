import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'assurance',
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    checks: {
      app: 'healthy',
      database: process.env.DATABASE_URL ? 'configured' : 'not_configured',
      redis: process.env.REDIS_URL ? 'configured' : 'not_configured',
      storage: process.env.S3_BUCKET ? 'configured' : 'not_configured',
      ai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
      email: process.env.SMTP_HOST ? 'configured' : 'not_configured',
      regulatory: {
        maslaka: process.env.MASLAKA_API_KEY ? 'configured' : 'not_configured',
        har_bituach: process.env.HAR_BITUACH_API_KEY ? 'configured' : 'not_configured',
        gamal_net: process.env.GAMAL_NET_API_KEY ? 'configured' : 'not_configured',
      },
    },
  };

  return NextResponse.json(health);
}
