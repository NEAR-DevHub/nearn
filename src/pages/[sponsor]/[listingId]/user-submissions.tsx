import { useQuery } from '@tanstack/react-query';
import { type GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import React from 'react';

import type { SubmissionWithUser } from '@/interface/submission';
import { ListingPageLayout } from '@/layouts/Listing';
import { api } from '@/lib/api';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getURL } from '@/utils/validUrl';

import { SubmissionTable } from '@/features/listings/components/SubmissionsPage/SubmissionTable';
import { userAllSubmissionsQuery } from '@/features/listings/queries/user-all-submissions';
import { type Listing } from '@/features/listings/types';

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
    bountyData = { submission: submissions.data, bounty: bountyDetails.data };
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

const UserSubmissionPage = ({
  bounty: bountyB,
  submission: submissionB,
}: {
  slug: string;
  bounty: Listing;
  submission: SubmissionWithUser[];
}) => {
  const { data: session } = useSession();

  const { data, refetch } = useQuery(
    userAllSubmissionsQuery(bountyB.id!, session?.user?.id ?? ''),
  );

  const submission = data ?? submissionB;

  const resetSubmissions = async () => {
    try {
      await refetch();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <ListingPageLayout bounty={bountyB} submissions={submission}>
      {bountyB && submission && (
        <SubmissionTable
          bounty={bountyB}
          setUpdate={resetSubmissions}
          submissions={submission}
          endTime={bountyB.deadline as string}
        />
      )}
    </ListingPageLayout>
  );
};

export default UserSubmissionPage;
