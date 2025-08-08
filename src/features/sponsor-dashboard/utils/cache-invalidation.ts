import { type QueryClient } from '@tanstack/react-query';

import { type SubmissionWithUser } from '@/interface/submission';

import { type ListingWithSubmissions } from '@/features/listings/types';

interface PaymentUpdateContext {
  submissionId: string;
  listingId: string;
  listingSlug: string;
  sponsorId: string;
  isPaid: boolean;
  paymentDetails?: any;
}

/**
 * Centralized cache invalidation utility for payment-related updates
 * Ensures all relevant queries are invalidated when payment status changes
 */
export class PaymentCacheManager {
  constructor(private queryClient: QueryClient) {}

  /**
   * Invalidates all caches related to a payment status update
   */
  async invalidatePaymentCaches(context: PaymentUpdateContext): Promise<void> {
    const { submissionId, listingId, listingSlug, sponsorId } = context;

    // invalidate all submission-related queries with standardized patterns
    await Promise.all([
      // main submissions query for the listing (sponsor dashboard)
      this.queryClient.invalidateQueries({
        queryKey: ['sponsor-submissions', listingSlug],
      }),

      // dashboard submissions (all submissions for sponsor)
      this.queryClient.invalidateQueries({
        queryKey: ['submissions-dashboard', sponsorId],
      }),

      // individual submission details (public view)
      this.queryClient.invalidateQueries({
        queryKey: ['submission-details', { submissionId }],
      }),

      // listing submissions (public view with winners filter)
      this.queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            queryKey[0] === 'listingSubmissions' &&
            queryKey.length > 1 &&
            typeof queryKey[1] === 'object' &&
            queryKey[1] !== null &&
            'slug' in queryKey[1] &&
            (queryKey[1] as any).slug === listingSlug
          );
        },
      }),

      // dashboard listings (contains payment counts)
      this.queryClient.invalidateQueries({
        queryKey: ['dashboard', sponsorId],
      }),

      // sponsor dashboard listing query (individual listing details)
      this.queryClient.invalidateQueries({
        queryKey: ['sponsor-dashboard-listing', listingSlug],
      }),

      // treasury-related queries (all treasury status queries)
      this.queryClient.invalidateQueries({
        queryKey: ['treasuryProposalStatus'],
      }),

      // user submission status
      this.queryClient.invalidateQueries({
        queryKey: ['userSubmission', listingId],
      }),

      // submission count queries
      this.queryClient.invalidateQueries({
        queryKey: ['submissionCount', listingId],
      }),
    ]);
  }

  /**
   * Optimistically updates submission data in cache
   */
  updateSubmissionOptimistically(
    context: PaymentUpdateContext,
    updateFn: (submission: SubmissionWithUser) => SubmissionWithUser,
  ): void {
    const { listingSlug, submissionId } = context;

    // update submissions query cache
    this.queryClient.setQueryData<SubmissionWithUser[]>(
      ['sponsor-submissions', listingSlug],
      (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((submission) =>
          submission.id === submissionId ? updateFn(submission) : submission,
        );
      },
    );
  }

  /**
   * Updates listing payment counts optimistically
   */
  updateListingPaymentCount(
    sponsorId: string,
    listingId: string,
    increment: number,
  ): void {
    this.queryClient.setQueryData<ListingWithSubmissions[]>(
      ['dashboard', sponsorId],
      (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((listing) =>
          listing.id === listingId
            ? {
                ...listing,
                BountyCounts: {
                  ...listing.BountyCounts,
                  totalPaymentsMade:
                    (listing.BountyCounts?.totalPaymentsMade || 0) + increment,
                },
              }
            : listing,
        );
      },
    );
  }

  /**
   * Forces a complete refresh of all payment-related data
   */
  async forceRefreshPaymentData(context: PaymentUpdateContext): Promise<void> {
    await this.invalidatePaymentCaches(context);

    // force refetch of critical queries
    await Promise.all([
      this.queryClient.refetchQueries({
        queryKey: ['sponsor-submissions', context.listingSlug],
      }),
      this.queryClient.refetchQueries({
        queryKey: ['dashboard', context.sponsorId],
      }),
    ]);
  }
}

/**
 * Helper function to create payment update context
 */
export function createPaymentUpdateContext(
  submission: SubmissionWithUser,
  listing: { id: string; slug: string; sponsorId: string },
  paymentDetails?: any,
): PaymentUpdateContext {
  return {
    submissionId: submission.id,
    listingId: listing.id,
    listingSlug: listing.slug,
    sponsorId: listing.sponsorId,
    isPaid: submission.isPaid,
    paymentDetails,
  };
}
