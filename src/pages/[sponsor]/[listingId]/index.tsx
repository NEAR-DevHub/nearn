import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';

import { type SubmissionWithUser } from '@/interface/submission';
import { ListingPageLayout } from '@/layouts/Listing';
import { api } from '@/lib/api';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getURL } from '@/utils/validUrl';

import { ListingPop } from '@/features/conversion-popups/components/ListingPop';
import { DescriptionUI } from '@/features/listings/components/ListingPage/DescriptionUI';
import { ListingWinners } from '@/features/listings/components/ListingPage/ListingWinners';
import { type Listing } from '@/features/listings/types';

interface BountyDetailsProps {
  bounty: Listing | null;
  submissions: SubmissionWithUser[];
}

function BountyDetails({ bounty: bounty, submissions }: BountyDetailsProps) {
  return (
    <ListingPageLayout bounty={bounty} submissions={submissions}>
      <ListingPop listing={bounty} />
      {bounty?.isWinnersAnnounced && (
        <div className="mt-6 hidden w-full md:block">
          <ListingWinners bounty={bounty} />
        </div>
      )}
      <div className="max-w-4xl">
        <DescriptionUI description={bounty?.description} />
      </div>
    </ListingPageLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { sponsor, listingId } = context.query;
  const session = await getServerSession(context.req, context.res, authOptions);

  let bountyData;
  let submissions;
  try {
    const bountyDetails = await api.get(
      `${getURL()}api/listings/details/by-sponsor-and-id/${sponsor}/${listingId}`,
      {
        headers: {
          Authorization: `Bearer ${session?.token}`,
          cookie: context.req.headers.cookie,
        },
      },
    );
    bountyData = bountyDetails.data;
    const submissionsData = await api.get(
      `${getURL()}api/listings/submissions/${bountyData.slug}`,
      {
        headers: {
          Authorization: `Bearer ${session?.token}`,
          cookie: context.req.headers.cookie,
        },
      },
    );
    submissions = submissionsData.data.submission;
  } catch (e) {
    console.error(e);
    bountyData = null;
  }

  if (!bountyData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      bounty: bountyData,
      submissions,
    },
  };
};
export default BountyDetails;
