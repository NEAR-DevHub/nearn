import { type GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';

import { api } from '@/lib/api';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getURL } from '@/utils/validUrl';

import SubmissionPage from './submission';

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
      userOnly: true,
    },
  };
};
export default SubmissionPage;
