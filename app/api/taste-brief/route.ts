import { NextResponse } from 'next/server';
import { APP_NAME } from '@/lib/app-config';

/** Retired Market Desk taste-brief endpoint. */
export async function GET() {
  return NextResponse.json(
    {
      error: 'gone',
      message: `${APP_NAME} replaced the taste-brief API. Use POST /api/partners.`,
    },
    { status: 410 }
  );
}

export async function POST() {
  return GET();
}
