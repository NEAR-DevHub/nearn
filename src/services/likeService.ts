import {
  type Comment,
  type GrantApplication,
  NotificationRelationType,
  type PoW,
  type Submission,
} from '@prisma/client';
import { type InputJsonValue } from '@prisma/client/runtime/library';

import { prisma } from '@/prisma';

import { createNotification } from '@/features/notifications/services/notification-service';
import { NotificationType } from '@/features/notifications/types';
import { type SubmissionWithListingUser } from '@/features/sponsor-dashboard/queries/dashboard-submissions';

interface LikeEntry {
  id: string;
  date: number;
}

interface LikeableItem {
  id: string;
  like: unknown;
  likeCount: number;
}

export async function updateLike(
  model: 'submission' | 'poW' | 'grantApplication' | 'comment',
  itemId: string,
  userId: string,
) {
  let result: LikeableItem | null = null;

  if (model === 'submission') {
    result = await prisma.submission.findFirst({
      where: {
        id: itemId,
      },
      select: {
        id: true,
        like: true,
        likeCount: true,
      },
    });
  } else if (model === 'poW') {
    result = await prisma.poW.findFirst({
      where: {
        id: itemId,
      },
      select: {
        id: true,
        like: true,
        likeCount: true,
      },
    });
  } else if (model === 'grantApplication') {
    result = await prisma.grantApplication.findFirst({
      where: {
        id: itemId,
      },
      select: {
        id: true,
        like: true,
        likeCount: true,
      },
    });
  } else if (model === 'comment') {
    result = await prisma.comment.findFirst({
      where: {
        id: itemId,
      },
      select: {
        id: true,
        like: true,
        likeCount: true,
      },
    });
  } else {
    throw new Error('Invalid model provided');
  }

  if (!result) {
    throw new Error(`${model} not found`);
  }

  let newLikes: LikeEntry[] = [];
  const resLikes = result.like as LikeEntry[] | null;

  if (resLikes && resLikes.length > 0) {
    const existingLike = resLikes.find((e) => e.id === userId);
    if (existingLike) {
      newLikes = resLikes.filter((e) => e.id !== userId);
    } else {
      newLikes = [
        ...resLikes,
        {
          id: userId,
          date: Date.now(),
        },
      ];
    }
  } else {
    newLikes = [
      {
        id: userId,
        date: Date.now(),
      },
    ];
  }

  const likeCount = newLikes.length;

  let updateLike: unknown;
  let receiverId: string | undefined;
  let notificationRelationType: NotificationRelationType | undefined;
  const entities: {
    actorId?: string | null;
    listingId?: string | null;
    submissionId?: string | null;
    sponsorId?: string | null;
    commentId?: string | null;
    powId?: string | null;
  } = { actorId: userId };

  if (model === 'submission') {
    updateLike = await prisma.submission.update({
      where: {
        id: itemId,
      },
      data: {
        like: newLikes as unknown as InputJsonValue,
        likeCount,
      },
      include: {
        listing: {
          select: {
            sponsorId: true,
          },
        },
      },
    });
    receiverId = (updateLike as Submission).userId as string;
    notificationRelationType = NotificationRelationType.TALENT;
    entities.submissionId = itemId;
    entities.listingId = (updateLike as Submission).listingId;
    entities.sponsorId = (
      updateLike as unknown as SubmissionWithListingUser
    ).listing?.sponsorId;
  } else if (model === 'poW') {
    updateLike = await prisma.poW.update({
      where: {
        id: itemId,
      },
      data: {
        like: newLikes as unknown as InputJsonValue,
        likeCount,
      },
    });
    receiverId = (updateLike as PoW).userId as string;
    notificationRelationType = NotificationRelationType.TALENT;
    entities.powId = itemId;
  } else if (model === 'grantApplication') {
    updateLike = await prisma.grantApplication.update({
      where: {
        id: itemId,
      },
      data: {
        like: newLikes as unknown as InputJsonValue,
        likeCount,
      },
    });
    receiverId = (updateLike as GrantApplication).userId as string;
    notificationRelationType = NotificationRelationType.TALENT;
  } else if (model === 'comment') {
    updateLike = await prisma.comment.update({
      where: {
        id: itemId,
      },
      data: {
        like: newLikes as unknown as InputJsonValue,
        likeCount,
      },
    });
    receiverId = (updateLike as Comment).authorId as string;
    entities.commentId = itemId;
    notificationRelationType =
      (updateLike as Comment).type === 'INTERNAL_SUBMISSION_NOTES'
        ? NotificationRelationType.SPONSOR
        : NotificationRelationType.TALENT;
    if ((updateLike as Comment).refType === 'SUBMISSION') {
      const submission = await prisma.submission.findFirst({
        where: {
          id: (updateLike as Comment).refId,
        },
        select: {
          listingId: true,
          listing: {
            select: {
              sponsorId: true,
            },
          },
        },
      });
      entities.listingId = submission?.listingId;
      entities.sponsorId = submission?.listing?.sponsorId;
      entities.submissionId = (updateLike as Comment).refId;
    } else if ((updateLike as Comment).refType === 'BOUNTY') {
      const listing = await prisma.bounties.findUnique({
        where: {
          id: (updateLike as Comment).refId,
        },
        select: {
          sponsorId: true,
        },
      });
      entities.listingId = (updateLike as Comment).refId;
      entities.sponsorId = listing?.sponsorId;
    }
  }

  if (
    likeCount > (result?.likeCount || 0) &&
    receiverId &&
    notificationRelationType
  ) {
    await createNotification(
      NotificationType.LIKE,
      notificationRelationType,
      receiverId,
      entities,
    );
  }

  return {
    likesIncremented: likeCount > (result?.likeCount || 0),
    updatedData: updateLike,
  };
}
