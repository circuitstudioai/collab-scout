/**
 * API Route: Generate Taste Brief
 * POST /api/taste-brief
 * 
 * Integration endpoint for Market Desk (circuit-analyst.vercel.app)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ResearchBriefSchema } from '@/lib/agent/schema';
import { generateTasteBrief } from '@/lib/agent/orchestrator';

export const maxDuration = 60; // Allow up to 60 seconds for generation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = ResearchBriefSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid research brief format',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const brief = validationResult.data;
    console.log('[API] Generating taste brief for:', brief.title);

    // Generate taste brief using agent
    const tasteBrief = await generateTasteBrief(brief);

    console.log('[API] Taste brief generated successfully');

    return NextResponse.json({
      success: true,
      data: tasteBrief,
    });
  } catch (error) {
    console.error('[API] Error generating taste brief:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate taste brief',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    service: 'Market Desk Taste Agent',
    status: 'operational',
    version: '1.0.0',
    qloo_mode: process.env.USE_QLOO_MOCK === 'true' ? 'mock' : 'live',
    endpoints: {
      generate: 'POST /api/taste-brief',
    },
  });
}
