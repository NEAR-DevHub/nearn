import { NextResponse } from 'next/server';

import { checkListingStatus } from '@/cron-jobs/jobs/check-listing-status';
import { checkMilestoneStatus } from '@/cron-jobs/jobs/check-milestone-status';
import { verifyCronSecret } from '@/cron-jobs/lib/auth';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [listingStatus, milestoneStatus] = await Promise.all([
      checkListingStatus(),
      checkMilestoneStatus(),
    ]);

    return NextResponse.json(
      { listingStatus, milestoneStatus },
      { status: listingStatus.success && milestoneStatus.success ? 200 : 500 },
    );
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
