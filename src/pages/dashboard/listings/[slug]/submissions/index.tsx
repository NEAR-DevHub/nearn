import type { GetServerSideProps } from 'next';

import { prisma } from '@/prisma';

export default function SubmissionsIndex() {
  // This page should never render due to server-side redirect
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.query;

  // Fetch submissions server-side
  const submissions = await prisma.submission.findMany({
    where: {
      listing: {
        slug: slug as string,
      },
    },
    orderBy: [
      {
        winnerPosition: 'asc',
      },
      {
        sequentialId: 'asc',
      },
    ],
  });

  const submissionWithAWinner = submissions.find(
    (submission) => submission.isWinner,
  );
  const submission = submissionWithAWinner ?? submissions[0];

  return {
    redirect: {
      destination: `/dashboard/listings/${slug}/submissions/${submission?.sequentialId}`,
      permanent: false,
    },
  };
};
