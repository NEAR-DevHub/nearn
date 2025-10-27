import { NextResponse } from 'next/server';

import { verifyCronSecret } from '@/cron-jobs/lib/auth';
import { prisma } from '@/prisma';

import { type Rewards } from '@/features/listings/types';
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

    const {
      milestoneId: milestoneIdInput,
      paymentLink,
      paymentDate,
      submissionId,
    } = requestBody;
    let milestoneId = milestoneIdInput;

    if ((!milestoneId && !submissionId) || !paymentLink || !paymentDate) {
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

    if (!milestoneId && submissionId) {
      const submission = await prisma.submission.findUnique({
        where: {
          id: submissionId,
        },
        include: {
          Milestones: {
            orderBy: {
              milestoneIndex: 'asc',
            },
          },
          listing: true,
        },
      });

      if (!submission) {
        return NextResponse.json(
          { error: 'Submission not found' },
          { status: 404 },
        );
      }

      if (!submission?.Milestones || submission.Milestones.length === 0) {
        // Milestones not configured yet. Pre-create full payment
        const totalReward =
          submission?.winnerPosition !== null
            ? submissionId.listing[
                submission?.winnerPosition as keyof Rewards
              ] || 0
            : 0;
        const token =
          submission?.listing.token === 'Any'
            ? submission.token || submission.listing.token
            : submission.listing.token;
        const result = await prisma.milestone.create({
          data: {
            submissionId,
            milestoneIndex: 1,
            title: 'Full Payment',
            description: 'Single milestone for full payment',
            reward: totalReward,
            token: token!,
            status: 'Approved',
          },
        });
        milestoneId = result.id;
      } else {
        // Search for first non-paid milestone
        milestoneId = submission.Milestones.find(
          (m) => m.status !== 'Paid',
        )?.id;
      }
    }

    let milestone;
    if (milestoneId) {
      milestone = await prisma.milestone.findUnique({
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
    }

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
