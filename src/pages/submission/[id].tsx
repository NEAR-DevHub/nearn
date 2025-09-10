import { type GetServerSideProps } from 'next';

import { prisma } from '@/prisma';
import { getBountyUrl } from '@/utils/bounty-urls';

import { type Listing } from '@/features/listings/types';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;

  const submission = await prisma.submission.findUnique({
    where: {
      id: id as string,
    },
    include: {
      listing: {
        include: {
          sponsor: true,
        },
      },
    },
  });

  if (!submission) {
    return {
      notFound: true,
    };
  }

  return {
    redirect: {
      destination: `${getBountyUrl(submission.listing as unknown as Listing)}/${submission.sequentialId}`,
      permanent: true,
    },
  };
};

const Nothing = () => {
  return <></>;
};
export default Nothing;
