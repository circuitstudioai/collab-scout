import { NextRequest, NextResponse } from 'next/server';
import { APP_NAME } from '@/lib/app-config';
import { parsePartnerBrief } from '@/lib/agent/schema';
import { scoutPartners } from '@/lib/agent/orchestrator';
import { isGeminiConfigured } from '@/lib/agent/gemini';
import { resolveQlooBaseUrl, shouldUseQlooMock } from '@/lib/qloo/config';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = parsePartnerBrief(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid partner brief', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = await scoutPartners(parsed.data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[API] partner scout failed', error);
    return NextResponse.json(
      {
        error: 'Failed to scout partners',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: APP_NAME,
    status: 'operational',
    version: '2.0.0',
    qloo_mode: shouldUseQlooMock() ? 'fallback_mock' : 'live',
    qloo_base_url: resolveQlooBaseUrl(),
    qloo_auth_header: 'X-Api-Key',
    gemini: isGeminiConfigured() ? 'gemini-2.5-flash' : 'canned_fallback',
    endpoints: { scout: 'POST /api/partners' },
    disclaimer: `${APP_NAME} never sends email or contacts anyone.`,
  });
}
