import { prisma } from '@/prisma';

export async function createSponsorEmailSettings(userId: string) {
  const categories = new Set([
    'commentSponsor',
    'deadlineSponsor',
    'productAndNewsletter',
    'replyOrTagComment',
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
          user: { connect: { id: userId } },
          channel,
          type: category,
        },
      });
    }
  }
}
