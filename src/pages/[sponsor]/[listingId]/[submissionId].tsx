import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { ArrowRight, ChevronLeft, Copy, ExternalLink } from 'lucide-react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import React, { Fragment, useEffect, useRef } from 'react';
import { MdOutlineAccountBalanceWallet, MdOutlineMail } from 'react-icons/md';
import { toast } from 'sonner';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { KycComponent } from '@/components/ui/KycComponent';
import { Tooltip } from '@/components/ui/tooltip';
import { tokenList } from '@/constants/tokenList';
import { useClipboard } from '@/hooks/use-clipboard';
import type { SubmissionWithUser } from '@/interface/submission';
import { ListingPageLayout } from '@/layouts/Listing';
import { api } from '@/lib/api';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getBountyUrl, getSubmissionUrl } from '@/utils/bounty-urls';
import { cn } from '@/utils/cn';
import { getURLSanitized } from '@/utils/getURLSanitized';
import { truncatePublicKey } from '@/utils/truncatePublicKey';
import { truncateString } from '@/utils/truncateString';
import { getURL } from '@/utils/validUrl';

import {
  LikeAndComment,
  selectedSubmissionAtom,
} from '@/features/listings/components/SubmissionsPage/SubmissionTable';
import { listingSubmissionsQuery } from '@/features/listings/queries/submissions';
import { type Listing } from '@/features/listings/types';
import PublicLoggingWithComments from '@/features/logging/components/PublicLoggingWithComments';
import {
  Discord,
  GitHub,
  Linkedin,
  Telegram,
  Twitter,
  Website,
} from '@/features/social/components/SocialIcons';
import { Details } from '@/features/sponsor-dashboard/components/Submissions/Details';
import { EarnAvatar } from '@/features/talent/components/EarnAvatar';
import TreasuryStatus from '@/features/treasury/components/TreasuryStatus';

function Content({
  bounty: bountyB,
  submission: submissionB,
}: {
  bounty: Listing;
  submission: SubmissionWithUser;
}) {
  const commentsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;

    if (hash === '#comments' && commentsRef.current) {
      setTimeout(() => {
        if (commentsRef.current) {
          commentsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    if (hash.startsWith('#comment-')) {
      const commentId = hash.substring(1);

      const scrollToComment = () => {
        const commentElement = document.getElementById(commentId);
        if (!commentElement) return;

        commentElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        commentElement.classList.add(
          'bg-yellow-100',
          'border-l-4',
          'border-yellow-400',
          'pl-2',
          '-ml-2',
          'rounded-md',
        );

        setTimeout(() => {
          commentElement.classList.remove(
            'bg-yellow-100',
            'border-l-4',
            'border-yellow-400',
            'pl-2',
            '-ml-2',
            'rounded-md',
          );
        }, 3000);
      };

      setTimeout(scrollToComment, 150);
    }
  }, []);

  const { data, refetch } = useQuery(
    listingSubmissionsQuery(
      { slug: bountyB.slug! },
      {
        bounty: bountyB,
        submission: [submissionB],
      },
    ),
  );

  const { bounty, submission: submissions } = data ?? {
    bounty: bountyB,
    submission: [submissionB],
  };

  const submission = submissions.find((s) => s.id === submissionB.id);

  const resetSubmission = async () => {
    try {
      await refetch();
    } catch (e) {
      console.log(e);
    }
  };
  const { onCopy: onCopyEmail } = useClipboard(submission?.user?.email || '');

  const { onCopy: onCopyPublicKey } = useClipboard(
    submission?.user?.publicKey || '',
  );

  const { onCopy: onCopySubmissionLink } = useClipboard(
    getSubmissionUrl(submission, bounty),
  );
  const [, setSelectedSubmission] = useAtom(selectedSubmissionAtom);

  useEffect(() => {
    setSelectedSubmission(submission);
  }, [submission]);

  const handleCopySubmissionLink = () => {
    onCopySubmissionLink();
    toast.success('Submission link copied', {
      duration: 1500,
    });
  };

  const handleCopyEmail = () => {
    if (submission?.user?.email) {
      onCopyEmail();
      toast.success('Email copied', {
        duration: 1500,
      });
    }
  };

  const handleCopyPublicKey = () => {
    if (submission?.user?.publicKey) {
      onCopyPublicKey();
      toast.success('Wallet address copied', {
        duration: 1500,
      });
    }
  };

  const isUsdBased = bounty?.token === 'Any';
  const tokenName = isUsdBased ? submission?.token : bounty?.token;
  const token = tokenList.find((s) => s.tokenSymbol === tokenName);

  let amount = bounty?.compensationType === 'fixed' ? 0 : submission?.ask;
  if (submission?.isWinner && submission?.winnerPosition) {
    amount = bounty?.rewards?.[submission?.winnerPosition] ?? 0;
  }

  if (!submission) {
    return <div>Submission not found</div>;
  }

  const socials = [
    {
      icon: (
        <Telegram
          key="telegram"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={submission?.user?.telegram || ''}
        />
      ),
      isVisible: !!submission?.user?.telegram,
    },
    {
      icon: (
        <Twitter
          key="twitter"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={submission?.user?.twitter || ''}
        />
      ),
      isVisible: !!submission?.user?.twitter,
    },
    {
      icon: (
        <Discord
          key="discord"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={submission?.user?.discord || ''}
        />
      ),
      isVisible: !!submission?.user?.discord,
    },
    {
      icon: (
        <Linkedin
          key="linkedin"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={submission?.user?.linkedin || ''}
        />
      ),
      isVisible: !!submission?.user?.linkedin,
    },
    {
      icon: (
        <GitHub
          key="github"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={submission?.user?.github || ''}
        />
      ),
      isVisible: !!submission?.user?.github,
    },
    {
      icon: (
        <Website
          key="website"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={submission?.user?.website || ''}
        />
      ),
      isVisible: !!submission?.user?.website,
    },
  ];

  const showBack =
    (bounty.isWinnersAnnounced && bounty.type === 'bounty') ||
    bounty.type === 'sponsorship';

  return (
    <>
      <div className="flex h-full w-full flex-col justify-between">
        {showBack && (
          <Breadcrumb className="mt-4 text-slate-400 md:mt-5">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`${getBountyUrl(bounty)}/submission`}
                    className="flex items-center"
                  >
                    <ChevronLeft className="mr-1 h-6 w-6" />
                    All Submissions
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}

        <div className="mt-4 h-full rounded-lg md:mt-4 md:px-2">
          <div className="rounded-t-xl border-b border-slate-200 bg-white">
            <div className="flex w-full items-center justify-between">
              <div className="flex w-full items-center gap-2">
                <EarnAvatar
                  className="h-10 w-10"
                  id={submission?.user?.id}
                  avatar={submission?.user?.photo || undefined}
                />
                <div className="w-full">
                  <div className="flex w-full justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="w-full whitespace-nowrap font-medium text-slate-900">
                        {`${(submission?.user?.name ?? submission?.user?.username)?.split(' ')[0]}'s Submission`}
                        <span className="ml-1 text-slate-500">
                          #{submission?.sequentialId}
                        </span>
                      </p>
                    </div>
                  </div>

                  <Link
                    className="flex w-full items-center whitespace-nowrap text-xs font-medium text-black"
                    href={`/t/${submission?.user?.username}`}
                  >
                    View Profile <ArrowRight className="inline-block h-3 w-3" />
                  </Link>
                </div>
                <div className="hidden gap-4 md:flex">
                  <LikeAndComment
                    id={submission?.id}
                    bounty={bounty}
                    submission={submission}
                    setUpdate={resetSubmission}
                    ref={commentsRef}
                  />
                  <Button
                    variant="outline"
                    className="px-2 py-1 text-slate-500"
                    onClick={handleCopySubmissionLink}
                  >
                    <Copy className="mr-1 h-4 w-4" />
                    Copy Link
                  </Button>
                </div>
                {submission?.isWinner &&
                  submission?.winnerPosition &&
                  ((submission?.isPaid && submission?.paymentDetails?.link) ||
                    submission.paymentDetails?.treasury?.link) && (
                    <div className="ph-no-capture hidden items-center justify-end gap-2 md:flex">
                      <Button
                        className="text-slate-600"
                        onClick={() => {
                          window.open(
                            getURLSanitized(
                              submission?.paymentDetails?.link ??
                                submission.paymentDetails?.treasury?.link ??
                                '',
                            ),
                            '_blank',
                          );
                        }}
                        size="default"
                        variant="outline"
                      >
                        <ExternalLink className="mr-1 h-4 w-4" />
                        View Payment
                      </Button>
                    </div>
                  )}

                {submission?.isWinner &&
                  submission?.winnerPosition &&
                  submission?.isPaid &&
                  !submission?.paymentDetails?.link && (
                    <div className="ph-no-capture hidden items-center justify-end gap-2 md:flex">
                      <Button
                        className="text-slate-600"
                        disabled
                        size="default"
                        variant="outline"
                      >
                        Marked as paid
                      </Button>
                    </div>
                  )}
              </div>
            </div>

            {submission.paymentDetails?.treasury && (
              <div className="ml-auto flex w-fit px-4 py-1 text-xs">
                <TreasuryStatus
                  treasury={submission.paymentDetails?.treasury}
                  submissionId={submission.id}
                  submissionIsPaid={submission.isPaid}
                  updateSubmission={() => {
                    refetch();
                  }}
                />
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <div className="flex gap-5">
                {!!amount && amount > 0 && (
                  <div className="flex items-start text-sm font-medium text-slate-950">
                    <img
                      src={token?.icon}
                      alt={token?.tokenSymbol}
                      className="h-4 w-4 rounded-full"
                    />
                    <span className="ml-1">
                      {isUsdBased && '$'}
                      {amount.toLocaleString('en-us')}
                      <span className="text-slate-400">
                        {isUsdBased && ' to be paid in'}
                      </span>
                      <span
                        className={cn(
                          'ml-1',
                          !isUsdBased && 'font-semibold text-slate-400',
                        )}
                      >
                        {token?.tokenSymbol}
                      </span>
                    </span>
                  </div>
                )}

                {submission?.user?.publicKey && (
                  <div className="flex items-center gap-1">
                    <Tooltip
                      content={'Click to copy'}
                      contentProps={{ side: 'right' }}
                      triggerClassName="flex items-center hover:underline underline-offset-1"
                    >
                      <div
                        className="flex cursor-pointer items-center justify-start gap-1 whitespace-nowrap text-sm text-slate-400 hover:text-slate-500"
                        onClick={handleCopyPublicKey}
                        role="button"
                        tabIndex={0}
                        aria-label={`Copy public key: ${truncatePublicKey(submission.user.publicKey, 20)}`}
                      >
                        <MdOutlineAccountBalanceWallet />
                        <p>
                          {truncatePublicKey(submission.user.publicKey, 20)}
                        </p>
                      </div>
                    </Tooltip>
                    <div className="mb-0.5">
                      <KycComponent
                        address={submission?.user?.publicKey}
                        imageOnly
                        listingSponsorId={bounty?.sponsorId}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-5">
                {submission?.user?.email && (
                  <Tooltip
                    content={'Click to copy'}
                    contentProps={{ side: 'right' }}
                    triggerClassName="flex items-center hover:underline underline-offset-1"
                  >
                    <div
                      className="flex cursor-pointer items-center justify-start gap-1 text-sm text-slate-400 hover:text-slate-500"
                      onClick={handleCopyEmail}
                      role="button"
                      tabIndex={0}
                      aria-label={`Copy email: ${submission.user.email}`}
                    >
                      <MdOutlineMail />
                      {truncateString(submission.user.email, 36)}
                    </div>
                  </Tooltip>
                )}

                <div className="flex gap-2">
                  {socials
                    .filter((social) => social.isVisible)
                    .map((social) => (
                      <Fragment key={social.icon.key}>{social.icon}</Fragment>
                    ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full border-t border-slate-200">
            <Details
              bounty={bounty}
              selectedSubmission={submission}
              externalView
            />
          </div>
        </div>
        <div className="md:px-2" ref={commentsRef}>
          <PublicLoggingWithComments listing={bounty} submission={submission} />
        </div>
      </div>
      <div className="ph-no-capture fixed bottom-0 left-1/2 z-50 flex w-full -translate-x-1/2 bg-white px-3 pb-4 pt-2 md:hidden">
        <div className="mb-12 flex h-12 w-full items-center gap-4 text-lg hover:opacity-90 disabled:opacity-70">
          <div>
            <LikeAndComment
              id={submission?.id}
              bounty={bounty}
              submission={submission}
              setUpdate={resetSubmission}
              ref={commentsRef}
            />
          </div>
          <Button
            variant="outline"
            className="w-full text-slate-500"
            onClick={handleCopySubmissionLink}
          >
            <Copy className="mr-1 h-4 w-4" />
            Copy Link
          </Button>
        </div>
      </div>
    </>
  );
}

function SubmissionPage({
  bounty,
  submission,
}: {
  bounty: Listing;
  submission: SubmissionWithUser;
}) {
  return (
    <>
      <div>
        <ListingPageLayout bounty={bounty} submissions={[submission]}>
          <Content bounty={bounty} submission={submission} />
        </ListingPageLayout>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { sponsor, listingId, submissionId } = context.query;
  const sequentialId = parseInt(submissionId as string);

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

  const submission =
    bountyData?.submission.find(
      (submission: SubmissionWithUser) =>
        submission.sequentialId === sequentialId,
    ) ?? null;

  if (!submission) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      slug,
      bounty: bountyData.bounty,
      submission,
    },
  };
};
export default SubmissionPage;
