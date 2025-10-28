import { type GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import React from 'react';

import { type SubmissionWithUser } from '@/interface/submission';
import { ListingPageLayout } from '@/layouts/Listing';
import { api } from '@/lib/api';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getURL } from '@/utils/validUrl';

import MilestoneTable from '@/features/listings/components/SubmissionsPage/MilestoneTable';
import { type Listing } from '@/features/listings/types';
import { type SubmissionWithListingUser } from '@/features/sponsor-dashboard/queries/dashboard-submissions';

export default function MilestonePage({
  bounty,
  submission,
}: {
  bounty: Listing;
  submission: SubmissionWithListingUser;
}) {
  return (
    <ListingPageLayout bounty={bounty} submissions={[submission]}>
      <div className="py-4">
        {' '}
        {bounty && submission && (
          <MilestoneTable
            submission={{ ...submission, listing: bounty }}
            listing={bounty}
          />
        )}
      </div>
    </ListingPageLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { sponsor, listingId } = context.query;

  const session = await getServerSession(context.req, context.res, authOptions);

  let bountyData;
  let slug;
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
    slug = bountyDetails.data.slug;
    const submissions = await api.get(
      `${getURL()}api/submission/user-listing-submissions`,
      {
        headers: {
          Authorization: `Bearer ${session?.token}`,
          cookie: context.req.headers.cookie,
        },
        params: {
          listingId: bountyDetails.data.id,
        },
      },
    );

    const submissionWithMilestones = submissions.data.filter(
      (submission: SubmissionWithUser) => submission.Milestones.length > 1,
    );

    if (submissionWithMilestones.length !== 1) {
      return {
        redirect: {
          destination: `/${sponsor}/${listingId}/user-submissions`,
          permanent: false,
        },
      };
    }

    bountyData = {
      submission: submissionWithMilestones[0],
      bounty: bountyDetails.data,
    };
  } catch (e) {
    console.log(e);
    bountyData = null;
  }

  if (!bountyData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      slug,
      bounty: bountyData.bounty,
      submission: bountyData.submission,
    },
  };
};
