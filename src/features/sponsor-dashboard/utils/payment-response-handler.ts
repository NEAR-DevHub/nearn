import { type QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { type SubmissionWithUser } from '@/interface/submission';

import {
  createPaymentUpdateContext,
  PaymentCacheManager,
} from './cache-invalidation';

interface PaymentResponseHandlerOptions {
  queryClient: QueryClient;
  listing: {
    id: string;
    slug: string;
    sponsorId: string;
  };
  onSubmissionUpdate?: (submission: SubmissionWithUser) => void;
}

/**
 * Utility class to handle payment-related API responses and ensure immediate UI updates
 */
export class PaymentResponseHandler {
  private cacheManager: PaymentCacheManager;

  constructor(private options: PaymentResponseHandlerOptions) {
    this.cacheManager = new PaymentCacheManager(options.queryClient);
  }

  /**
   * Handles successful payment verification response
   */
  async handlePaymentVerificationSuccess(
    validationResults: Array<{
      submissionId: string;
      status: 'SUCCESS' | 'FAIL';
      txId?: string;
      link?: string;
      transactionDate?: string;
      message?: string;
    }>,
    submissions: SubmissionWithUser[],
  ): Promise<void> {
    const successfulResults = validationResults.filter(
      (r) => r.status === 'SUCCESS',
    );

    if (successfulResults.length === 0) {
      return;
    }

    // update each successful submission
    for (const result of successfulResults) {
      const submission = submissions.find((s) => s.id === result.submissionId);
      if (!submission) continue;

      const updatedSubmission: SubmissionWithUser = {
        ...submission,
        isPaid: true,
        paymentDetails: {
          ...submission.paymentDetails,
          txId: result.txId,
          link: result.link,
        },
        paymentDate: result.transactionDate || new Date().toISOString(),
      };

      // create context for cache updates
      const context = createPaymentUpdateContext(
        updatedSubmission,
        this.options.listing,
        { txId: result.txId, link: result.link },
      );

      // update cache optimistically
      this.cacheManager.updateSubmissionOptimistically(
        context,
        () => updatedSubmission,
      );

      // notify parent component
      this.options.onSubmissionUpdate?.(updatedSubmission);
    }

    // invalidate all related caches
    if (successfulResults.length > 0) {
      const firstResult = successfulResults[0];
      const firstSubmission = firstResult
        ? submissions.find((s) => s.id === firstResult.submissionId)
        : undefined;
      if (firstSubmission) {
        const context = createPaymentUpdateContext(
          firstSubmission,
          this.options.listing,
        );
        await this.cacheManager.invalidatePaymentCaches(context);
      }

      // update payment count
      this.cacheManager.updateListingPaymentCount(
        this.options.listing.sponsorId,
        this.options.listing.id,
        successfulResults.length,
      );

      // show success message
      toast.success(
        `${successfulResults.length} payment${successfulResults.length > 1 ? 's' : ''} verified successfully`,
      );
    }
  }

  /**
   * Handles force payment verification response
   */
  async handleForcePaymentVerificationSuccess(
    validationResults: Array<{
      submissionId: string;
      status: 'SUCCESS' | 'FAIL';
      link?: string;
      message?: string;
    }>,
    submissions: SubmissionWithUser[],
  ): Promise<void> {
    const successfulResults = validationResults.filter(
      (r) => r.status === 'SUCCESS',
    );

    if (successfulResults.length === 0) {
      return;
    }

    // update each successful submission
    for (const result of successfulResults) {
      const submission = submissions.find((s) => s.id === result.submissionId);
      if (!submission) continue;

      const updatedSubmission: SubmissionWithUser = {
        ...submission,
        isPaid: true,
        paymentDetails: {
          ...submission.paymentDetails,
          link: result.link,
        },
        paymentDate: new Date().toISOString(),
      };

      // create context for cache updates
      const context = createPaymentUpdateContext(
        updatedSubmission,
        this.options.listing,
        { link: result.link },
      );

      // force refresh for override payments
      await this.cacheManager.forceRefreshPaymentData(context);

      // notify parent component
      this.options.onSubmissionUpdate?.(updatedSubmission);
    }

    // update payment count
    this.cacheManager.updateListingPaymentCount(
      this.options.listing.sponsorId,
      this.options.listing.id,
      successfulResults.length,
    );

    toast.success(
      `${successfulResults.length} payment${successfulResults.length > 1 ? 's' : ''} force verified successfully`,
    );
  }

  /**
   * Handles treasury proposal creation response
   */
  async handleTreasuryProposalSuccess(
    treasuryData: {
      link: string;
      proposalId: number;
      dao: string;
    },
    submission: SubmissionWithUser,
  ): Promise<void> {
    const updatedSubmission: SubmissionWithUser = {
      ...submission,
      paymentDetails: {
        ...submission.paymentDetails,
        treasury: treasuryData,
      },
    };

    // Create context for cache updates
    const context = createPaymentUpdateContext(
      updatedSubmission,
      this.options.listing,
      { treasury: treasuryData },
    );

    // Update cache optimistically
    this.cacheManager.updateSubmissionOptimistically(
      context,
      () => updatedSubmission,
    );

    // Invalidate treasury-related caches
    await this.cacheManager.invalidatePaymentCaches(context);

    // Notify parent component
    this.options.onSubmissionUpdate?.(updatedSubmission);

    toast.success('Treasury proposal created successfully');
  }

  /**
   * Handles payment date update response
   */
  async handlePaymentDateUpdateSuccess(
    newDate: string,
    submission: SubmissionWithUser,
  ): Promise<void> {
    const updatedSubmission: SubmissionWithUser = {
      ...submission,
      paymentDate: newDate,
    };

    // Create context for cache updates
    const context = createPaymentUpdateContext(
      updatedSubmission,
      this.options.listing,
    );

    // Update cache optimistically
    this.cacheManager.updateSubmissionOptimistically(
      context,
      () => updatedSubmission,
    );

    // Invalidate related caches
    await this.cacheManager.invalidatePaymentCaches(context);

    // Notify parent component
    this.options.onSubmissionUpdate?.(updatedSubmission);

    toast.success('Payment date updated successfully');
  }
}

/**
 * Factory function to create a payment response handler
 */
export function createPaymentResponseHandler(
  options: PaymentResponseHandlerOptions,
): PaymentResponseHandler {
  return new PaymentResponseHandler(options);
}
