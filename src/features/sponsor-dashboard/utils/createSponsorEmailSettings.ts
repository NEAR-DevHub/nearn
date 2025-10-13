import { prisma } from '@/prisma';

export async function createGeneralEmailSettings(userId: string) {
  const categories = new Set([
    'COMMENT_REPLY',
    'COMMENT_MENTIONED_YOU',
    'COMMENT_PINNED',
    'LIKE',
    'PRODUCT_UPDATES_AND_NEWS',
    'SPONSOR_MEMBER_INVITED',
  ]);

  for (const channel of ['email', 'inApp']) {
    for (const category of categories) {
      if (channel === 'inApp' && category === 'PRODUCT_UPDATES_AND_NEWS') {
        continue;
      }
      await prisma.notificationSettings.deleteMany({
        where: {
          userId,
          channel,
          type: category,
        },
      });
      await prisma.notificationSettings.create({
        data: {
          user: { connect: { id: userId } },
          channel,
          type: category,
        },
      });
    }
  }
}

export async function createSponsorEmailSettings(
  userId: string,
  sponsorId: string,
) {
  const categories = new Set([
    'SUBMISSION_CREATED',
    'SUBMISSION_EDITED',
    'LISTING_COMMENT',
    'DEADLINE_EXCEEDED_BY_WEEK',
    'NOTE_CREATED',
    'TREASURY_PROPOSAL_STATUS_CHANGED',
    'SPONSOR_MEMBER_ACCEPTED',
  ]);

  for (const channel of ['email', 'inApp']) {
    for (const category of categories) {
      await prisma.notificationSettings.deleteMany({
        where: {
          userId,
          channel,
          type: category,
        },
      });
      await prisma.notificationSettings.create({
        data: {
          userId,
          channel,
          type: category,
          sponsorId: sponsorId,
          listingScope: 'mine',
        },
      });
    }
  }
}
