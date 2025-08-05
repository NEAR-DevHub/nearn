import type { NextApiRequest, NextApiResponse } from 'next';

import logger from '@/lib/logger';
import { safeStringify } from '@/utils/safeStringify';
import { syncSubmissionTreasuryStatus } from '@/utils/treasury-sync';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  logger.debug(`Request body: ${safeStringify(req.body)}`);
  const { id } = req.body;

  try {
    const result = await syncSubmissionTreasuryStatus(id);

    if (!result.success) {
      // Map different error types to appropriate status codes
      let statusCode = 400;
      if (result.error === 'Submission not found') {
        statusCode = 404;
      }

      return res.status(statusCode).json({
        error: result.error,
        message: result.message,
      });
    }

    return res.status(200).json({
      message: result.message,
      status: result.status,
    });
  } catch (error: any) {
    logger.error(
      `Error syncing treasury status for submission ${id}: ${safeStringify(
        error,
      )}`,
    );
    return res.status(400).json({
      error: error.message,
      message: `Error occurred while syncing treasury status for submission ${id}.`,
    });
  }
}
