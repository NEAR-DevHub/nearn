import { type GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';

import { api } from '@/lib/api';
import BountyDetails from '@/pages/[sponsor]/[listingId]';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getBountyUrl } from '@/utils/bounty-urls';
import { getURL } from '@/utils/validUrl';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug, preview } = context.query;
  const session = await getServerSession(context.req, context.res, authOptions);
  let bountyData;
  try {
    const bountyDetails = await api.get(
      `${getURL()}api/listings/details/${slug}`,
      {
        headers: {
          Authorization: `Bearer ${session?.token}`,
          cookie: context.req.headers.cookie,
        },
      },
    );
    bountyData = bountyDetails.data;
  } catch (e) {
    console.error(e);
    bountyData = null;
  }

  if (!bountyData) {
    return {
      notFound: true,
    };
  }

  const baseDestination = getBountyUrl(bountyData);
  const hasPreview = Array.isArray(preview) ? preview[0] : preview;
  const destination = hasPreview
    ? `${baseDestination}?preview=1`
    : baseDestination;
  return {
    redirect: {
      destination,
      permanent: true,
    },
  };
};
export default BountyDetails;
