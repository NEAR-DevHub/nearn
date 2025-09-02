import { type GetServerSideProps } from 'next';

import { type SubmissionWithUser } from '@/interface/submission';
import { prisma } from '@/prisma';
import { getBountyUrl, getSubmissionUrl } from '@/utils/bounty-urls';

import { type Listing } from '@/features/listings/types';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;

  const comment = await prisma.comment.findUnique({
    where: {
      id: id as string,
    },
    include: {
      submission: {
        include: {
          listing: {
            include: {
              sponsor: true,
            },
          },
        },
      },
      listing: {
        include: {
          sponsor: true,
        },
      },
      pow: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!comment) {
    return {
      notFound: true,
    };
  }

  const wrapWithCommentId = (url: string) => {
    return `${url}#comment-${comment.id}`;
  };

  // Only bounty and submission comments are supported for now
  switch (comment.refType) {
    case 'BOUNTY':
      return {
        redirect: {
          destination: wrapWithCommentId(
            getBountyUrl(comment.listing as unknown as Listing),
          ),
          permanent: true,
        },
      };
    case 'SUBMISSION':
      if (comment?.type === 'INTERNAL_SUBMISSION_NOTES') {
        return {
          redirect: {
            destination: wrapWithCommentId(
              `/dashboard/listings/${comment.submission?.listing?.slug}/submissions/${comment.submission?.sequentialId}?tab=notes`,
            ),
            permanent: true,
          },
        };
      }
      return {
        redirect: {
          destination: wrapWithCommentId(
            getSubmissionUrl(
              comment.submission as unknown as SubmissionWithUser,
              comment.submission?.listing as unknown as Listing,
            ),
          ),
          permanent: true,
        },
      };
  }

  return {
    notFound: true,
  };
};

const Nothing = () => {
  return <></>;
};
export default Nothing;
