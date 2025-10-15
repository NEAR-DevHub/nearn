import type { NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { csvUpload, str2ab } from '@/utils/cloudinary';
import { safeStringify } from '@/utils/safeStringify';

import { type NextApiRequestWithSponsor } from '@/features/auth/types';
import { withSponsorAuth } from '@/features/auth/utils/withSponsorAuth';
import { convertToCSV } from '@/features/export/utils/convertToCSV';
import { type SubmissionWithListingUser } from '@/features/sponsor-dashboard/queries/dashboard-submissions';

async function handler(req: NextApiRequestWithSponsor, res: NextApiResponse) {
  const userId = req.userId;
  const submissionIds = req.body.submissionIds as string[] | undefined;
  const userSponsorId = req.userSponsorId;

  if (!submissionIds || submissionIds.length === 0) {
    return res.status(400).json({
      error: 'No submissions selected',
    });
  }

  const sponsor = await prisma.sponsors.findUnique({
    where: {
      id: userSponsorId,
    },
  });

  if (!sponsor) {
    return res.status(400).json({
      error: 'Sponsor not found',
    });
  }

  logger.debug(`Request query: ${safeStringify(req.query)}`);

  logger.debug(
    `Export request received for submissions - sponsorId: ${userSponsorId}`,
  );

  try {
    logger.debug(`Fetching submissions for sponsorId: ${userSponsorId}`);
    const submissions = await prisma.submission.findMany({
      where: {
        listing: {
          sponsorId: userSponsorId,
          isActive: true,
        },
        id: { in: submissionIds },
      },
      include: {
        listing: {
          include: {
            sponsor: true,
          },
        },
        user: true,
        approvedByUser: true,
        Milestones: {
          include: {
            paidByUser: true,
            approvedByUser: true,
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
        createdAt: 'desc',
      },
    });

    logger.debug('Converting submissions to CSV');
    const csv = await convertToCSV(
      sponsor.id,
      submissions as unknown as SubmissionWithListingUser[],
    );
    const fileName = `${sponsor.slug}-submissions-${Date.now()}`;
    const file = str2ab(csv, fileName);

    logger.debug('Uploading CSV to Cloudinary');
    const cloudinaryDetails = await csvUpload(file, fileName, sponsor.slug);

    logger.info(`CSV export successful for listing ID: ${sponsor.slug}`);
    return res.status(200).json({
      url: cloudinaryDetails?.secure_url || cloudinaryDetails?.url,
    });
  } catch (error: any) {
    logger.error(
      `User ${userId} unable to download CSV: ${safeStringify(error)}`,
    );
    return res.status(400).json({
      error: error.message || error.toString(),
      message: `Error occurred while exporting submissions of sponsor=${sponsor.slug}.`,
    });
  }
}

export default withSponsorAuth(handler);
