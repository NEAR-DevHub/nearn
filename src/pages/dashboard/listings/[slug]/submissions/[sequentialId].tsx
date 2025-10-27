import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import debounce from 'lodash.debounce';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useMemo, useState } from 'react';

import { LoadingSection } from '@/components/shared/LoadingSection';
import { Button } from '@/components/ui/button';
import { ExternalImage } from '@/components/ui/cloudinary-image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDisclosure } from '@/hooks/use-disclosure';
import { type MilestoneWithUser } from '@/interface/submission';
import { SponsorLayout } from '@/layouts/Sponsor';
import { useUser } from '@/store/user';
import { cn } from '@/utils/cn';
import { dayjs } from '@/utils/dayjs';
import { getSubmissionPaymentStatus } from '@/utils/milestone-helpers';
import { cleanRewards } from '@/utils/rank';

import { BONUS_REWARD_POSITION } from '@/features/listing-builder/constants';
import {
  selectedSubmissionAtom,
  selectedSubmissionIdsAtom,
} from '@/features/sponsor-dashboard/atoms';
import ListingMilestoneTable from '@/features/sponsor-dashboard/components/Milestones/ListingMilestoneTable';
import { VerifyPaymentModal } from '@/features/sponsor-dashboard/components/Modals/VerifyPayment';
import { PublishModal } from '@/features/sponsor-dashboard/components/PublishModal';
import { ScoutTable } from '@/features/sponsor-dashboard/components/Scouts/ScoutTable';
import AddManualPaymentModal from '@/features/sponsor-dashboard/components/Submissions/Modals/AddManualPaymentModal';
import { SubmissionHeader } from '@/features/sponsor-dashboard/components/Submissions/SubmissionHeader';
import { SubmissionList } from '@/features/sponsor-dashboard/components/Submissions/SubmissionList';
import { SubmissionPanel } from '@/features/sponsor-dashboard/components/Submissions/SubmissionPanel';
import { type SubmissionWithListingUser } from '@/features/sponsor-dashboard/queries/dashboard-submissions';
import { sponsorDashboardListingQuery } from '@/features/sponsor-dashboard/queries/listing';
import { scoutsQuery } from '@/features/sponsor-dashboard/queries/scouts';
import { submissionsQuery } from '@/features/sponsor-dashboard/queries/submissions';
import { type ScoutRowType } from '@/features/sponsor-dashboard/types';

interface Props {
  slug: string;
  sequentialId: number;
}

const submissionsPerPage = 10;

export default function BountySubmissions({ slug, sequentialId }: Props) {
  const router = useRouter();
  const { pageTab } = router.query;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useUser();

  const [selectedSubmission, setSelectedSubmission] = useAtom(
    selectedSubmissionAtom,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [remainings, setRemainings] = useState<{
    podiums: number;
    bonus: number;
  } | null>(null);
  const [filterLabel, setFilterLabel] = useState<
    | 'New'
    | 'Reviewed'
    | 'Shortlisted'
    | 'Spam'
    | 'Paid'
    | 'Approved'
    | 'Rejected'
    | 'All'
  >('All');

  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = debounce(setSearchText, 300);

  const queryClient = useQueryClient();
  const posthog = usePostHog();

  const [activeTab, setActiveTab] = useState<string>(() => {
    const validTabs = ['submissions', 'scout', 'milestones'];
    return pageTab && validTabs.includes(pageTab as string)
      ? (pageTab as string)
      : 'submissions';
  });

  const [selectedSubmissionIds, setSelectedSubmissionIds] = useAtom(
    selectedSubmissionIdsAtom,
  );

  const {
    isOpen: verifyPaymentIsOpen,
    onOpen: verifyPaymentOnOpen,
    onClose: verifyPaymentOnClose,
  } = useDisclosure();

  const {
    isOpen: isAddManualPaymentModalOpen,
    onOpen: onAddManualPaymentOpen,
    onClose: onAddManualPaymentClose,
  } = useDisclosure();

  const {
    data: submissions,
    isLoading: isSubmissionsLoading,
    refetch: refetchSubmissions,
  } = useQuery(submissionsQuery(slug));

  const {
    data: bounty,
    isLoading: isBountyLoading,
    refetch: refetchBounty,
  } = useQuery(sponsorDashboardListingQuery(slug));

  const [verifyAllPayments, setVerifyAllPayments] = useState(false);

  const onVerifyPayments = () => {
    setVerifyAllPayments(true);
    verifyPaymentOnOpen();
  };
  useEffect(() => {
    if (submissions) {
      const submission = submissions?.find(
        (submission) => submission.sequentialId === sequentialId,
      );

      if (submission) {
        setSelectedSubmission(submission);
      }
    }
  }, [sequentialId, submissions]);

  useEffect(() => {
    const newSet = new Set(selectedSubmissionIds);
    Array.from(selectedSubmissionIds).forEach((a) => {
      const submissionWithId = submissions?.find(
        (submission) => submission.id === a,
      );
      if (submissionWithId && submissionWithId.status !== 'Pending') {
        newSet.delete(a);
      }
    });
    setSelectedSubmissionIds(newSet);
  }, [submissions]);

  const { data: scouts } = useQuery({
    ...scoutsQuery({
      bountyId: bounty?.id!,
    }),
    enabled: !!(
      !!bounty?.id &&
      bounty.isPublished &&
      !bounty.isWinnersAnnounced
    ),
  });

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions.filter((submission: SubmissionWithListingUser) => {
      const name = submission.user.name?.toLowerCase() || '';
      const email = submission.user.email?.toLowerCase() || '';
      const username = submission.user.username?.toLowerCase() || '';
      const twitter = submission.user.twitter?.toLowerCase() || '';
      const discord = submission.user.discord?.toLowerCase() || '';
      const link = submission.link?.toLowerCase() || '';
      const publicKey = submission.user.publicKey?.toLowerCase() || '';
      const searchLower = searchText?.toLowerCase() || '';

      const matchesSearch =
        searchText === '' ||
        submission.sequentialId?.toString().includes(searchLower) ||
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        username.includes(searchLower) ||
        publicKey.includes(searchLower) ||
        twitter.includes(searchLower) ||
        discord.includes(searchLower) ||
        link.includes(searchLower) ||
        (submission.internalNotes ?? []).some((note) =>
          note.message?.toLowerCase().includes(searchLower),
        );

      let matchesLabel = false;
      const paymentStatus = getSubmissionPaymentStatus({
        ...submission,
        listing: bounty,
      });

      if (filterLabel === 'All') {
        matchesLabel = true;
      } else if (filterLabel === 'Paid') {
        matchesLabel = paymentStatus.isPaid;
      } else if (filterLabel === 'Approved') {
        matchesLabel =
          submission.status === 'Approved' && !paymentStatus.isPaid;
      } else if (filterLabel === 'Rejected') {
        matchesLabel = submission.status === 'Rejected';
      } else {
        matchesLabel =
          submission.label === filterLabel && submission.status === 'Pending';
      }

      return matchesSearch && matchesLabel;
    });
  }, [submissions, searchText, filterLabel]);

  useEffect(() => {
    if (bounty && user?.currentSponsorId) {
      if (bounty.sponsorId !== user.currentSponsorId) {
        router.push('/dashboard/listings');
      }

      const podiumWinnersSelected = submissions?.filter(
        (submission) =>
          submission.isWinner &&
          submission.winnerPosition !== BONUS_REWARD_POSITION,
      ).length;

      const bonusWinnerSelected = submissions?.filter(
        (sub) => sub.isWinner && sub.winnerPosition === BONUS_REWARD_POSITION,
      ).length;

      const rewardsLength = cleanRewards(bounty.rewards, true).length;
      setRemainings({
        podiums: rewardsLength - (podiumWinnersSelected || 0),
        bonus: (bounty.maxBonusSpots || 0) - (bonusWinnerSelected || 0),
      });
    }
  }, [bounty, submissions, user?.currentSponsorId, router]);

  useEffect(() => {
    if (sequentialId && filteredSubmissions.length > 0) {
      const submissionIndex = filteredSubmissions.findIndex(
        (sub) => sub.sequentialId === Number(sequentialId),
      );
      if (submissionIndex !== -1) {
        const targetPage = Math.floor(submissionIndex / submissionsPerPage) + 1;
        if (targetPage !== currentPage) {
          setCurrentPage(targetPage);
        }
      }
    }
  }, [sequentialId, filteredSubmissions]);

  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * submissionsPerPage;
    return filteredSubmissions.slice(
      startIndex,
      startIndex + submissionsPerPage,
    );
  }, [filteredSubmissions, currentPage]);

  const totalPages = Math.ceil(filteredSubmissions.length / submissionsPerPage);

  const usedPositions = submissions
    ?.filter((s: any) => s.isWinner)
    .map((s: any) => Number(s.winnerPosition))
    .filter((key: number) => !isNaN(key));

  const totalWinners = submissions?.filter((sub) => sub.isWinner).length;
  const totalPaymentsMade = submissions?.filter((sub) => {
    const paymentStatus = getSubmissionPaymentStatus({
      ...sub,
      listing: bounty,
    });
    return paymentStatus.isPaid;
  }).length;

  const isExpired = dayjs(bounty?.deadline).isBefore(dayjs());

  const isSponsorVerified = bounty?.sponsor?.isVerified;

  useEffect(() => {
    if (
      pageTab &&
      ['submissions', 'scout', 'milestones'].includes(pageTab as string)
    ) {
      setActiveTab(pageTab as string);
    }
  }, [pageTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, pageTab: value },
      },
      undefined,
      { shallow: true },
    );
  };

  return (
    <SponsorLayout isCollapsible className="bg-slate-50">
      {isBountyLoading || isSubmissionsLoading ? (
        <LoadingSection />
      ) : (
        <>
          {isOpen && (
            <PublishModal
              remainings={remainings}
              isOpen={isOpen}
              onClose={onClose}
              totalWinners={totalWinners || 0}
              totalPaymentsMade={totalPaymentsMade || 0}
              bounty={bounty}
              usedPositions={usedPositions || []}
              setRemainings={setRemainings}
              submissions={submissions || []}
            />
          )}
          <SubmissionHeader
            bounty={bounty}
            refetchBounty={refetchBounty}
            totalSubmissions={submissions?.length || 0}
            setSelectedSubmission={(sequentialId) => {
              router.replace(
                `/dashboard/listings/${slug}/submissions/${sequentialId}`,
              );
            }}
            allTransactionsVerified={
              submissions?.every((submission) => {
                const paymentStatus = getSubmissionPaymentStatus({
                  ...submission,
                  listing: bounty,
                });
                return submission.status === 'Approved' && paymentStatus.isPaid;
              }) ?? true
            }
            onVerifyPayments={onVerifyPayments}
          />
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            {((bounty?.isPublished &&
              !bounty?.isWinnersAnnounced &&
              !isExpired) ||
              (bounty?.type !== 'bounty' &&
                submissions?.some(
                  (submission) => submission.Milestones.length > 1,
                ))) && (
              <>
                <TabsList className="gap-4 font-medium text-slate-400">
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
                  {isSponsorVerified && (
                    <TabsTrigger
                      value="scout"
                      className={cn(
                        'ph-no-capture',
                        !isSponsorVerified &&
                          'cursor-not-allowed text-slate-400',
                      )}
                      onClick={() => posthog.capture('scout tab_scout')}
                    >
                      Scout Talent
                    </TabsTrigger>
                  )}
                  {submissions?.some(
                    (submission) => submission.Milestones.length > 1,
                  ) && <TabsTrigger value="milestones">Milestones</TabsTrigger>}
                </TabsList>
                <div className="h-[1.5px] w-full bg-slate-200/70" />
              </>
            )}

            <TabsContent value="submissions" className="w-full px-0">
              <div className="flex w-full items-start rounded-xl bg-white">
                <div className="grid h-[calc(100vh-400px)] min-h-[500px] w-full grid-cols-[23rem_1fr] grid-rows-1 rounded-xl bg-white">
                  <div className="h-full w-full">
                    <SubmissionList
                      listing={bounty}
                      selectedSubmission={selectedSubmission}
                      setSelectedSubmission={(submission) => {
                        router.replace(
                          `/dashboard/listings/${slug}/submissions/${submission?.sequentialId}`,
                        );
                      }}
                      filterLabel={
                        filterLabel === 'All' ? undefined : filterLabel
                      }
                      setFilterLabel={async (e) => {
                        setFilterLabel(
                          e === undefined
                            ? 'All'
                            : (e as
                                | 'New'
                                | 'Reviewed'
                                | 'Shortlisted'
                                | 'Spam'
                                | 'Paid'
                                | 'Approved'
                                | 'Rejected'),
                        );
                        await setCurrentPage(1);
                      }}
                      submissions={paginatedSubmissions}
                      setSearchText={(e) => {
                        debouncedSearchText(e || '');
                      }}
                      type={bounty?.type}
                      refetchSubmissions={() => {
                        refetchSubmissions();
                      }}
                    />
                  </div>

                  {verifyPaymentIsOpen && (
                    <VerifyPaymentModal
                      listing={bounty}
                      setSelectedSubmission={(submission) => {
                        router.replace(
                          `/dashboard/listings/${slug}/submissions/${submission?.sequentialId}`,
                        );
                      }}
                      setListing={() => {}}
                      isOpen={verifyPaymentIsOpen}
                      onClose={() => {
                        verifyPaymentOnClose();
                        refetchBounty();
                        refetchSubmissions();
                      }}
                      listingId={bounty?.id}
                      listingType={bounty?.type}
                      selectedSubmission={
                        verifyAllPayments ? undefined : selectedSubmission
                      }
                    />
                  )}

                  <div className="h-full w-full rounded-r-xl border-b border-r border-t border-slate-200 bg-white">
                    {!paginatedSubmissions?.length &&
                    !searchText &&
                    !isSubmissionsLoading ? (
                      <>
                        <ExternalImage
                          className="mx-auto mt-32 w-32"
                          alt={'talent empty'}
                          src={'/bg/talent-empty.svg'}
                        />
                        <p className="mx-auto mt-5 text-center text-lg font-semibold text-slate-600">
                          {filterLabel ? 'Zero Results' : 'People are working!'}
                        </p>
                        <p className="mx-auto mb-[200px] text-center font-medium text-slate-400">
                          {filterLabel
                            ? 'For the filters you have selected'
                            : 'Submissions will start appearing here'}
                        </p>
                      </>
                    ) : (
                      <SubmissionPanel
                        isMultiSelectOn={selectedSubmissionIds.size > 0}
                        remainings={remainings}
                        setRemainings={setRemainings}
                        bounty={bounty}
                        submissions={paginatedSubmissions}
                        usedPositions={usedPositions || []}
                        onWinnersAnnounceOpen={onOpen}
                        onManualPaymentOpen={onAddManualPaymentOpen}
                        onVerifyPayment={() => {
                          setVerifyAllPayments(false);
                          verifyPaymentOnOpen();
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-start gap-4">
                <>
                  <Button
                    disabled={currentPage <= 1}
                    onClick={async () =>
                      await setCurrentPage(Math.max(currentPage - 1, 1))
                    }
                    size="sm"
                    variant="outline"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Previous
                  </Button>

                  <p className="text-sm text-slate-400">
                    <span className="font-bold">
                      {(currentPage - 1) * submissionsPerPage + 1}
                    </span>{' '}
                    -{' '}
                    <span className="font-bold">
                      {Math.min(
                        currentPage * submissionsPerPage,
                        filteredSubmissions.length,
                      )}
                    </span>{' '}
                    of{' '}
                    <span className="font-bold">
                      {filteredSubmissions.length}
                    </span>{' '}
                    Submissions
                  </p>

                  <Button
                    disabled={currentPage >= totalPages}
                    onClick={async () =>
                      await setCurrentPage(
                        Math.min(currentPage + 1, totalPages),
                      )
                    }
                    size="sm"
                    variant="outline"
                  >
                    Next
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </>
              </div>
            </TabsContent>

            {bounty &&
              bounty.id &&
              bounty.isPublished &&
              !bounty.isWinnersAnnounced &&
              !isExpired && (
                <TabsContent value="scout" className="px-0">
                  <ScoutTable
                    bountyId={bounty.id}
                    scouts={scouts || []}
                    setInvited={(userId: string) => {
                      queryClient.setQueryData(
                        ['scouts', bounty.id],
                        (oldData: ScoutRowType[] | undefined) => {
                          if (!oldData) return oldData;
                          return oldData.map((scout) =>
                            scout.userId === userId
                              ? { ...scout, invited: true }
                              : scout,
                          );
                        },
                      );
                    }}
                  />
                </TabsContent>
              )}

            {bounty &&
              submissions &&
              submissions?.some(
                (submission) => submission.Milestones.length > 1,
              ) && (
                <TabsContent
                  value="milestones"
                  className="h-full min-h-[500px] w-full overflow-y-auto px-0"
                >
                  <ListingMilestoneTable
                    listing={bounty}
                    submissions={submissions!}
                    sequentialId={sequentialId}
                  />
                </TabsContent>
              )}
          </Tabs>

          <AddManualPaymentModal
            isOpen={isAddManualPaymentModalOpen}
            onClose={onAddManualPaymentClose}
            milestone={selectedSubmission?.Milestones[0] as MilestoneWithUser}
            listingToken={bounty?.token}
            onSuccess={(_) => {
              refetchSubmissions();
            }}
          />
        </>
      )}
    </SponsorLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug, sequentialId } = context.query;

  return {
    props: { slug, sequentialId: Number(sequentialId) },
  };
};
