import { NextResponse } from 'next/server';

import { verifyCronSecret } from '@/cron-jobs/lib/auth';

import { eventLogger } from '@/features/logging/services/event-logger';
import { EventType } from '@/features/logging/types/event-data';

export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  // We re-use this secret
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requestBody = await request.json();

    const { message, submissionId, sponsorId, listingId, type } = requestBody;

    await eventLogger.log({
      eventType: EventType.AUTOMATION_LOG,
      actor: {
        type: 'SYSTEM',
      },
      entities: {
        submissionId,
        sponsorId,
        listingId,
      },
      data: {
        message,
        type,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
