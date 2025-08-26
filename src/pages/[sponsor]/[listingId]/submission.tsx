import { useQuery } from '@tanstack/react-query';
import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import React, { useMemo } from 'react';

import type { SubmissionWithUser } from '@/interface/submission';
import { ListingPageLayout } from '@/layouts/Listing';
import { api } from '@/lib/api';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { useUser } from '@/store/user';
import { getURL } from '@/utils/validUrl';

import { SubmissionTable } from '@/features/listings/components/SubmissionsPage/SubmissionTable';
import { listingSubmissionsQuery } from '@/features/listings/queries/submissions';
import { type Listing } from '@/features/listings/types';

const SubmissionPage = ({
  slug,
  bounty: bountyB,
  submission: submissionB,
  userOnly = false,
}: {
  slug: string;
  bounty: Listing;
  submission: SubmissionWithUser[];
  userOnly?: boolean;
}) => {
  const { data, refetch } = useQuery(
    listingSubmissionsQuery(
      { slug },
      {
        bounty: bountyB,
        submission: submissionB,
      },
    ),
  );
  const { user } = useUser();
  const { bounty, submission } = data ?? {
    bounty: bountyB,
    submission: submissionB,
  };
  const usedSubmissions = useMemo(() => {
    return userOnly
      ? submission.filter((s) => s.userId === user?.id)
      : submission;
  }, [submission, user, userOnly]);

  const resetSubmissions = async () => {
    try {
      await refetch();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <ListingPageLayout bounty={bounty} submissions={submission}>
      {bounty && submission && (
        <SubmissionTable
          bounty={bounty}
          setUpdate={resetSubmissions}
          submissions={usedSubmissions}
          endTime={bounty.deadline as string}
        />
      )}
    </ListingPageLayout>
  );
};

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
      `${getURL()}api/listings/submissions/${slug}`,
      {
        headers: {
          Authorization: `Bearer ${session?.token}`,
          cookie: context.req.headers.cookie,
        },
      },
    );
    bountyData = submissions.data;
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
export default SubmissionPage;
