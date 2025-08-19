import type { NextApiResponse } from 'next';

import { type SubmissionWithUser } from '@/interface/submission';
import logger from '@/lib/logger';
import { prisma } from '@/prisma';
import { getSubmissionUrl } from '@/utils/bounty-urls';
import { safeStringify } from '@/utils/safeStringify';
import { getURL } from '@/utils/validUrl';

import { type NextApiRequestWithUser } from '@/features/auth/types';
import { withAuth } from '@/features/auth/utils/withAuth';
import { type Listing } from '@/features/listings/types';

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  try {
    const { type } = req.body;

    if (!WEBHOOK_URL) {
      return res.status(500).json({ error: 'WEBHOOK_URL is not set' });
    }

    if (type === 'report-payment-issue') {
      const { submissionId } = req.body;

      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
          user: true,
          listing: {
            include: {
              sponsor: true,
            },
          },
        },
      });

      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          name: submission.user.name,
          userUrl: `${getURL()}t/${submission.user.username}`,
          submissionUrl: getSubmissionUrl(
            submission as any as SubmissionWithUser,
            submission.listing as any as Listing,
          ),
        }),
      });

      if (!response.ok) {
        logger.error(
          `Failed to send message: ${response.statusText} ${await response.text()}`,
        );
        return res.status(500).json({ error: 'Failed to send message' });
      }
    } else if (type === 'n8n-request') {
      const { message } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: {
          currentSponsor: true,
        },
      });

      if (!user || !user.currentSponsor) {
        return res.status(401).json({ error: 'User not found' });
      }

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: message,
          type,
          sponsor: user.currentSponsor.name,
          sponsorLink: `${getURL()}${user.currentSponsor.slug}`,
        }),
      });

      if (!response.ok) {
        logger.error(
          `Failed to send message: ${response.statusText} ${await response.text()}`,
        );
        return res.status(500).json({ error: 'Failed to send message' });
      }
    } else {
      logger.error(`Invalid type: ${type}`);
      return res.status(400).json({ error: 'Invalid type' });
    }

    return res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    logger.error(`Error reporting payment issue: ${safeStringify(error)}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
