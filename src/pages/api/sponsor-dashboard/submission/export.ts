import type { NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { csvUpload, str2ab } from '@/utils/cloudinary';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithSponsor } from '@/features/auth/types';
import { checkListingSponsorAuth } from '@/features/auth/utils/checkListingSponsorAuth';
import { withSponsorAuth } from '@/features/auth/utils/withSponsorAuth';
import { convertToCSV } from '@/features/export/utils/convertToCSV';
import { type SubmissionWithListingUser } from '@/features/sponsor-dashboard/queries/dashboard-submissions';

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const userId = req.userId;
  const userSponsorId = req.userSponsorId;

  logger.debug(`Request query: ${safeStringify(req.query)}`);

  const listingId = Array.isArray(req.query.listingId)
    ? req.query.listingId[0]
    : req.query.listingId;

  logger.debug(
    `Export request received - listingId: ${listingId}, userSponsorId: ${userSponsorId}`,
  );

  if (!listingId) {
    logger.error('Export request missing listingId parameter');
    return res.status(400).json({
      error: 'Missing required parameter: listingId',
    });
  }

  try {
    const { error, listing } = await checkListingSponsorAuth(
      userSponsorId,
      listingId,
    );
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    logger.debug(`Fetching submissions for listing ID: ${listingId}`);
    const submissions = await prisma.submission.findMany({
      where: {
        listingId,
        isActive: true,
        isArchived: false,
      },
      include: {
        user: true,
        listing: {
          include: {
            sponsor: true,
          },
        },
        approvedByUser: true,
        Milestones: {
          include: {
            paidByUser: true,
            approvedByUser: true,
          },
          orderBy: {
            milestoneIndex: 'asc',
          },
        },
        Comments: {
          where: {
            type: 'INTERNAL_SUBMISSION_NOTES',
            replyToId: null,
          },
          include: {
            author: true,
            replies: {
              include: {
                author: true,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 1000,
    });

    logger.debug('Converting JSON to CSV');
    const csv = await convertToCSV(
      listing.sponsorId,
      submissions as unknown as SubmissionWithListingUser[],
    );
    const fileName = `${listing.slug || listingId}-submissions-${Date.now()}`;
    const file = str2ab(csv, fileName);

    logger.debug('Uploading CSV to Cloudinary');
    const cloudinaryDetails = await csvUpload(file, fileName, listingId);

    logger.info(`CSV export successful for listing ID: ${listingId}`);
    return res.status(200).json({
      url: cloudinaryDetails?.secure_url || cloudinaryDetails?.url,
    });
  } catch (error: any) {
    logger.error(
      `User ${userId} unable to download CSV: ${safeStringify(error)}`,
    );
    return res.status(400).json({
      error: error.message || error.toString(),
      message: `Error occurred while exporting submissions of listing=${listingId}.`,
    });
  }
}

export default withSponsorAuth(handler);
