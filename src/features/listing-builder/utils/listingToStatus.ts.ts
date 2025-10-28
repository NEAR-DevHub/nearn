import { type ListingFormData, type ListingStatus } from '../types';

export const listingToStatus = (listing: ListingFormData): ListingStatus => {
  if (listing.status === 'OPEN') {
    if (listing.isPublished) {
      if (listing.isWinnersAnnounced) {
        if (
          listing?.isWinnersAnnounced &&
          (listing.totalWinnersSelected === 0 ||
            listing.totalWinnersSelected !== listing.totalPaymentsMade) &&
          listing.type === 'project'
        )
          return 'work in progress';

        if (
          listing.totalWinnersSelected &&
          listing.totalWinnersSelected !== listing.totalPaymentsMade
        ) {
          return 'payment pending';
        } else {
          return 'completed';
        }
      }
      return 'published';
    } else {
      if (!!listing.publishedAt) {
        return 'unpublished';
      } else {
        return 'draft';
      }
    }
  } else if (listing.status === 'VERIFYING') {
    return 'verifying';
  }
  return 'draft';
};
