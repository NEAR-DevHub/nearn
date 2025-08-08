import { useEffect, useRef } from 'react';

import { type SubmissionWithUser } from '@/interface/submission';

import { createPaymentUpdateContext } from '../utils/cache-invalidation';
import { usePaymentCacheManager } from './usePaymentCacheManager';

interface PaymentStatusMonitorOptions {
  submission?: SubmissionWithUser;
  listing?: {
    id: string;
    slug: string;
    sponsorId: string;
  };
  enabled?: boolean;
}

/**
 * Custom hook that monitors payment status changes and automatically refreshes related data
 * Provides automatic cache invalidation when payment status changes are detected
 */
export function usePaymentStatusMonitor({
  submission,
  listing,
  enabled = true,
}: PaymentStatusMonitorOptions) {
  const paymentCacheManager = usePaymentCacheManager();
  const previousPaymentStatus = useRef<boolean | undefined>(undefined);
  const previousPaymentDetails = useRef<any>(undefined);

  useEffect(() => {
    if (!enabled || !submission || !listing) {
      return;
    }

    const currentPaymentStatus = submission.isPaid;
    const currentPaymentDetails = submission.paymentDetails;

    // check if payment status changed
    const statusChanged =
      previousPaymentStatus.current !== undefined &&
      previousPaymentStatus.current !== currentPaymentStatus;

    // check if payment details changed (for cases where payment link is added/updated)
    const detailsChanged =
      previousPaymentDetails.current !== undefined &&
      JSON.stringify(previousPaymentDetails.current) !==
        JSON.stringify(currentPaymentDetails);

    if (statusChanged || detailsChanged) {
      // payment status or details changed, trigger comprehensive refresh
      const context = createPaymentUpdateContext(
        submission,
        listing,
        currentPaymentDetails,
      );

      // force refresh all payment-related data
      paymentCacheManager.forceRefreshPaymentData(context).catch(console.error);
    }

    // update refs for next comparison
    previousPaymentStatus.current = currentPaymentStatus;
    previousPaymentDetails.current = currentPaymentDetails;
  }, [
    submission?.isPaid,
    submission?.paymentDetails,
    submission?.id,
    listing?.id,
    enabled,
    paymentCacheManager,
  ]);

  /**
   * Manually trigger a payment status refresh
   */
  const triggerRefresh = async () => {
    if (!submission || !listing) return;

    const context = createPaymentUpdateContext(submission, listing);
    await paymentCacheManager.forceRefreshPaymentData(context);
  };

  return {
    triggerRefresh,
  };
}

/**
 * Hook for monitoring multiple submissions for payment status changes
 */
export function useMultiplePaymentStatusMonitor({
  submissions,
  listing,
  enabled = true,
}: {
  submissions?: SubmissionWithUser[];
  listing?: {
    id: string;
    slug: string;
    sponsorId: string;
  };
  enabled?: boolean;
}) {
  const paymentCacheManager = usePaymentCacheManager();
  const previousSubmissions = useRef<
    Map<string, { isPaid: boolean; paymentDetails: any }>
  >(new Map());

  useEffect(() => {
    if (!enabled || !submissions || !listing) {
      return;
    }

    let hasChanges = false;
    const changedSubmissions: SubmissionWithUser[] = [];

    submissions.forEach((submission) => {
      const previous = previousSubmissions.current.get(submission.id);
      const current = {
        isPaid: submission.isPaid,
        paymentDetails: submission.paymentDetails,
      };

      if (previous) {
        const statusChanged = previous.isPaid !== current.isPaid;
        const detailsChanged =
          JSON.stringify(previous.paymentDetails) !==
          JSON.stringify(current.paymentDetails);

        if (statusChanged || detailsChanged) {
          hasChanges = true;
          changedSubmissions.push(submission);
        }
      }

      previousSubmissions.current.set(submission.id, current);
    });

    if (hasChanges && changedSubmissions.length > 0) {
      // multiple submissions changed, trigger comprehensive refresh
      const first = changedSubmissions[0];
      if (first) {
        const context = createPaymentUpdateContext(first, listing);
        paymentCacheManager
          .forceRefreshPaymentData(context)
          .catch(console.error);
      }
    }
  }, [submissions, listing, enabled, paymentCacheManager]);

  const triggerRefresh = async () => {
    if (!submissions || !listing || submissions.length === 0) return;

    const first = submissions[0];
    if (!first) return;
    const context = createPaymentUpdateContext(first, listing);
    await paymentCacheManager.forceRefreshPaymentData(context);
  };

  return {
    triggerRefresh,
  };
}
