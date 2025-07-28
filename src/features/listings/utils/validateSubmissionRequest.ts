import { prisma } from '@/prisma';

import { userRegionEligibilty } from './region';

export async function validateSubmissionRequest(
  userId: string,
  listingId: string,
  isGodMode: boolean,
) {
  const [user, listing] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.bounties.findUnique({
      where: { id: listingId },
      include: { BountyCounts: true },
    }),
  ]);

  if (!user) throw new Error('User not found');
  if (!user.isTalentFilled) throw new Error('Unauthorized: Profile incomplete');
  if (!listing) throw new Error('Listing not found');
  if (!listing.isPublished && !listing.isActive)
    throw new Error('Listing not available');
  if (
    !userRegionEligibilty({
      region: listing.region,
      userLocation: user.location || '',
    }) &&
    !isGodMode
  )
    throw new Error('Region not eligible');

  return { user, listing };
}
