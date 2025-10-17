import { NextResponse } from 'next/server';

import { verifyCronSecret } from '@/cron-jobs/lib/auth';
import { prisma } from '@/prisma';

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

    const { milestoneId, paymentLink, paymentDate } = requestBody;

    if (!milestoneId || !paymentLink || !paymentDate) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: [milestoneId, paymentLink, paymentDate]',
        },
        { status: 400 },
      );
    }

    const date = new Date(paymentDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid payment date' },
        { status: 400 },
      );
    }

    const milestone = await prisma.milestone.findUnique({
      where: {
        id: milestoneId,
      },
      include: {
        submission: {
          include: {
            listing: true,
            Milestones: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 },
      );
    }

    await prisma.milestone.update({
      where: {
        id: milestoneId,
      },
      data: {
        status: 'Paid',
        paidDate: date,
        paymentDetails: {
          link: paymentLink,
        },
      },
    });

    await eventLogger.log({
      eventType: EventType.SUBMISSION_PAID,
      actor: {
        type: 'SYSTEM',
      },
      entities: {
        submissionId: milestone.submissionId,
        sponsorId: milestone.submission.listing.sponsorId,
        listingId: milestone.submission.listing.id,
        milestoneId:
          milestone.submission.Milestones.length > 1 ? milestone.id : undefined,
      },
      data: {
        link: paymentLink,
      },
    });

    const bounty = await prisma.bounties.findUnique({
      where: {
        id: milestone.submission.listingId,
      },
      include: {
        BountyCounts: true,
      },
    });
    if (
      bounty &&
      bounty.isWinnersAnnounced &&
      bounty?.BountyCounts.totalPaymentsMade ===
        bounty.BountyCounts.totalWinnersSelected
    ) {
      eventLogger.log({
        eventType: EventType.SYSTEM_STATUS_CHANGED,
        actor: {
          type: 'SYSTEM',
        },
        data: {
          oldStatus: 'Payment Pending',
          newStatus: 'Completed',
        },
        entities: {
          listingId: milestone.submission.listingId,
          sponsorId: milestone.submission.listing.sponsorId,
        },
      });
    }

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
