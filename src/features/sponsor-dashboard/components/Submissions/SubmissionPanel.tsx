import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { useAtom } from 'jotai';
import {
  Clock2,
  Info,
  Loader2,
  MessageSquare,
  NotebookText,
  Pencil,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import router from 'next/router';
import React, {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { type MilestoneWithUser } from '@/interface/submission';
import type { User } from '@/interface/user';
import { cn } from '@/utils/cn';
import { setupCommentLinking } from '@/utils/comment-highlighting';
import { dayjs } from '@/utils/dayjs';
import { getSubmissionPaymentStatus } from '@/utils/milestone-helpers';

import { Comments } from '@/features/comments/components/Comments';
import { useCommentCount } from '@/features/comments/queries/comment-count';
import { PaymentSetupDialog } from '@/features/listing-payment-setup/components/PaymentSetupDialog';
import type { Listing } from '@/features/listings/types';
import LogsTimeline from '@/features/logging/components/LogsTimeline';
import { useGetLogsInfinite } from '@/features/logging/queries';
import TreasuryStatus from '@/features/treasury/components/TreasuryStatus';

import { selectedSubmissionAtom } from '../../atoms';
import { type SubmissionWithListingUser } from '../../queries/dashboard-submissions';
import { PaymentButton } from '../Shared/PaymentButton';
import { Details } from './Details';
import { DisplayPayment } from './DisplayPayment';
import NearTreasuryPaymentModal from './Modals/NearTreasuryPaymentModal';
import { SelectWinnersGuide } from './Modals/SelectWinnersGuide';
import { UpdatePaymentDateModal } from './Modals/UpdateDateModal';
import { SelectLabel } from './SelectLabel';
import { SelectWinner } from './SelectWinner';
import { SubmissionSocialRow, SubmissionTalent } from './SubmissionTalent';

interface Props {
  bounty: Listing | undefined;
  submissions: SubmissionWithListingUser[];
  usedPositions: number[];
  isHackathonPage?: boolean;
  onWinnersAnnounceOpen: () => void;
  remainings: { podiums: number; bonus: number } | null;
  setRemainings: Dispatch<
    SetStateAction<{ podiums: number; bonus: number } | null>
  >;
  onManualPaymentOpen: () => void;
  isMultiSelectOn?: boolean;
  onVerifyPayment: () => void;
}

interface SubmissionMenuProps {
  submissions: SubmissionWithListingUser[];
  bounty: Listing | undefined;
  usedPositions: number[];
  isHackathonPage: boolean;
  onWinnersAnnounceOpen: () => void;
  remainings: { podiums: number; bonus: number } | null;
  setRemainings: Dispatch<
    SetStateAction<{ podiums: number; bonus: number } | null>
  >;
  isMultiSelectOn: boolean;
  onVerifyPayment: () => void;
  onManualPaymentOpen: () => void;
}

export function SubmissionMenu({
  submissions,
  bounty,
  usedPositions,
  isHackathonPage,
  onWinnersAnnounceOpen,
  remainings,
  setRemainings,
  isMultiSelectOn,
  onVerifyPayment,
  onManualPaymentOpen,
}: SubmissionMenuProps) {
  const [isNearTreasuryPaymentModalOpen, setIsNearTreasuryPaymentModalOpen] =
    useState(false);
  const [selectedSubmission, setSelectedSubmission] = useAtom(
    selectedSubmissionAtom,
  );
  const [isPaymentSetupDialogOpen, setIsPaymentSetupDialogOpen] =
    useState(false);

  const afterAnnounceDate =
    bounty?.type === 'hackathon'
      ? dayjs().isAfter(bounty?.Hackathon?.announceDate)
      : true;

  const isProject = bounty?.type === 'project';
  const isSponsorship = bounty?.type === 'sponsorship';

  const milestones = selectedSubmission?.Milestones || [];
  const milestone = milestones[0];
  const paymentStatus = selectedSubmission
    ? getSubmissionPaymentStatus(selectedSubmission)
    : null;

  let announceWinnerText =
    'All winners have been selected. Click the button to announce them and move to the payment stage';
  if (bounty?.isWinnersAnnounced) {
    announceWinnerText =
      'You cannot change the winners once the results are published!';
  }

  if (remainings?.podiums !== 0 || remainings?.bonus !== 0) {
    announceWinnerText =
      'Allocate the whole prize pool or edit the listing to shrink it before you can continue';
  }

  const renderPaymentSection = () => {
    if (
      !selectedSubmission?.isWinner ||
      !selectedSubmission?.winnerPosition ||
      paymentStatus?.isPaid
    ) {
      return null;
    }

    if (!(bounty?.isWinnersAnnounced || isSponsorship)) {
      return null;
    }

    // Case 1: No milestones -> Show PaymentSetupDialog
    if (milestones.length === 0) {
      return (
        <Button
          onClick={() => setIsPaymentSetupDialogOpen(true)}
          className="ph-no-capture min-w-[150px]"
        >
          Payment Setup
        </Button>
      );
    }

    // Case 2: 1 Milestone -> Use existing logic
    if (milestones.length === 1) {
      return (
        <PaymentButton
          milestone={milestone as MilestoneWithUser}
          onVerifyPayment={onVerifyPayment}
          setIsNearTreasuryPaymentModalOpen={setIsNearTreasuryPaymentModalOpen}
          onManualPaymentOpen={onManualPaymentOpen}
        />
      );
    }

    // Case 3: >1 Milestone -> Show "View Milestones" button with status
    const completedMilestones = milestones.filter(
      (m) => m.status === 'Paid',
    ).length;
    const totalMilestones = milestones.length;

    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={() => {
            router.push(
              {
                pathname: router.pathname,
                query: { ...router.query, pageTab: 'milestones' },
              },
              undefined,
              { shallow: true },
            );
          }}
          className="ph-no-capture min-w-[120px]"
          variant="outline"
        >
          View Milestones
        </Button>
        <span className="text-sm text-slate-500">
          {completedMilestones}/{totalMilestones} completed
        </span>
      </div>
    );
  };

  return (
    <>
      <div
        className={'ph-no-capture flex w-full items-center justify-end gap-2'}
      >
        {renderPaymentSection()}

        {selectedSubmission?.isWinner &&
          selectedSubmission?.winnerPosition &&
          paymentStatus?.isPaid && (
            <DisplayPayment
              milestone={milestone as MilestoneWithUser}
              listing={bounty as Listing}
              isSponsorView={true}
            />
          )}
        {selectedSubmission?.status === 'Pending' &&
          milestone?.status !== 'Paid' && (
            <SelectLabel listingSlug={bounty?.slug!} />
          )}

        {!bounty?.isWinnersAnnounced &&
          selectedSubmission?.status === 'Pending' && (
            <>
              <SelectWinner
                onWinnersAnnounceOpen={onWinnersAnnounceOpen}
                isMultiSelectOn={!!isMultiSelectOn}
                bounty={bounty}
                usedPositions={usedPositions}
                setRemainings={setRemainings}
                submissions={submissions}
                isHackathonPage={isHackathonPage}
              />
              {!isProject && !isSponsorship && (
                <div className="flex items-center gap-2">
                  <Tooltip
                    content={announceWinnerText}
                    contentProps={{
                      side: 'bottom',
                      align: 'center',
                      className: 'w-[97%]',
                    }}
                  >
                    <Button
                      className={cn(
                        'bg-slate-900 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-500 disabled:hover:bg-gray-500',
                      )}
                      disabled={
                        !afterAnnounceDate ||
                        isHackathonPage ||
                        remainings?.podiums !== 0 ||
                        remainings?.bonus !== 0
                      }
                      onClick={onWinnersAnnounceOpen}
                      variant="default"
                    >
                      Announce Winners
                    </Button>
                  </Tooltip>
                  <SelectWinnersGuide />
                </div>
              )}
            </>
          )}
      </div>

      {selectedSubmission && (
        <>
          <NearTreasuryPaymentModal
            isOpen={isNearTreasuryPaymentModalOpen}
            onClose={() => setIsNearTreasuryPaymentModalOpen(false)}
            milestoneId={milestone?.id || ''}
            onSuccess={(
              treasuryLink: string,
              proposalId: number,
              dao: string,
            ) => {
              setSelectedSubmission((prev) =>
                prev && prev.id === selectedSubmission?.id
                  ? {
                      ...prev,
                      paymentDetails: {
                        treasury: { link: treasuryLink, proposalId, dao },
                      },
                    }
                  : prev,
              );
            }}
          />

          {milestones.length === 0 && selectedSubmission?.winnerPosition && (
            <PaymentSetupDialog
              open={isPaymentSetupDialogOpen}
              onOpenChange={setIsPaymentSetupDialogOpen}
              projectAmount={
                bounty?.rewards?.[selectedSubmission?.winnerPosition] ?? 0
              }
              tokenSymbol={
                bounty?.token === 'Any'
                  ? selectedSubmission?.token!
                  : bounty?.token!
              }
              submissionId={selectedSubmission?.id}
              onSave={(milestones: MilestoneWithUser[]) => {
                setSelectedSubmission((prev) =>
                  prev && prev.id === selectedSubmission?.id
                    ? {
                        ...prev,
                        Milestones: milestones,
                      }
                    : prev,
                );
                setIsPaymentSetupDialogOpen(false);
              }}
            />
          )}
        </>
      )}
    </>
  );
}

export const DoneBy = ({
  doneBy,
  doneByType,
}: {
  doneBy: User | undefined;
  doneByType: 'approved' | 'paid';
}) => {
  return (
    <div className="flex items-center">
      <p className="flex items-center gap-1 text-sm text-slate-400">
        {doneByType === 'approved' ? 'Approved by' : 'Paid by'}: {doneBy?.name}
      </p>
    </div>
  );
};

export const SubmissionPanel = ({
  bounty,
  submissions,
  usedPositions,
  isHackathonPage,
  onWinnersAnnounceOpen,
  remainings,
  setRemainings,
  isMultiSelectOn,
  onVerifyPayment,
  onManualPaymentOpen,
}: Props) => {
  const [selectedSubmission, setSelectedSubmission] = useAtom(
    selectedSubmissionAtom,
  );

  const { data: commentData, refetch: refetchCommentCount } = useCommentCount(
    selectedSubmission?.id,
  );
  const { data: notesData, refetch: refetchNotes } = useCommentCount(
    selectedSubmission?.id,
    'INTERNAL_SUBMISSION_NOTES',
  );
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || 'activity';

  const commentsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;

    // Handle comments section scroll
    if (hash === '#comments' && commentsRef.current) {
      setTimeout(() => {
        if (commentsRef.current) {
          commentsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    // Handle comment linking
    const cleanup = setupCommentLinking();
    return cleanup;
  }, []);

  const {
    data: logs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetLogsInfinite({
    refType: 'submission',
    refId: selectedSubmission?.id,
  });

  const [isUpdateDateModalOpen, setIsUpdateDateModalOpen] = useState(false);

  const handleUpdatePaymentDate = () => {
    setIsUpdateDateModalOpen(true);
  };

  const milestone =
    selectedSubmission?.Milestones && selectedSubmission?.Milestones.length > 0
      ? selectedSubmission?.Milestones[0]
      : null;

  return (
    <>
      <div className="sticky top-[3rem] flex h-full w-full flex-col">
        {submissions.length ? (
          <>
            <div className="rounded-t-xl border-b border-slate-200 bg-white py-1">
              <div className="flex w-full items-center justify-between px-4 pt-3">
                <SubmissionTalent
                  submission={selectedSubmission}
                  bounty={bounty}
                />

                <SubmissionMenu
                  submissions={submissions}
                  bounty={bounty}
                  isMultiSelectOn={isMultiSelectOn ?? false}
                  usedPositions={usedPositions}
                  isHackathonPage={isHackathonPage ?? false}
                  onWinnersAnnounceOpen={onWinnersAnnounceOpen}
                  remainings={remainings}
                  setRemainings={setRemainings}
                  onVerifyPayment={onVerifyPayment}
                  onManualPaymentOpen={onManualPaymentOpen}
                />
              </div>
              {milestone && (
                <div className="ml-auto flex w-fit px-4 py-1 text-xs">
                  <TreasuryStatus
                    treasury={milestone?.paymentDetails?.treasury}
                    milestoneId={milestone?.id ?? ''}
                    milestoneIsPaid={milestone?.status === 'Paid'}
                    updateSubmission={(status) => {
                      setSelectedSubmission((prev) =>
                        prev && prev.id === selectedSubmission?.id
                          ? {
                              ...prev,
                              Milestones:
                                prev.Milestones?.map((m) => {
                                  if (m.id === milestone?.id) {
                                    if (status === 'Approved') {
                                      return {
                                        ...m,
                                        status: 'Paid',
                                        paidDate: new Date(),
                                        paymentDetails: {
                                          ...m.paymentDetails,
                                          link: m.paymentDetails?.treasury
                                            ?.link,
                                        },
                                      };
                                    } else {
                                      return {
                                        ...m,
                                        paymentDetails: {
                                          ...m.paymentDetails,
                                          treasury: {
                                            ...m.paymentDetails?.treasury,
                                            synced: true,
                                          },
                                        },
                                      };
                                    }
                                  }
                                  return m;
                                }) || [],
                            }
                          : prev,
                      );
                    }}
                  />
                </div>
              )}
              <div className="px-4">
                <SubmissionSocialRow
                  submission={selectedSubmission}
                  bounty={bounty}
                />
              </div>
            </div>
            <div className="flex h-full min-h-0 w-full">
              <div className="flex min-h-0 w-2/3 flex-col">
                <div className="flex gap-4 px-4 pt-4">
                  <div className="flex items-center">
                    <p className="text-sm text-slate-400">
                      Created on:{' '}
                      {dayjs(selectedSubmission?.createdAt).format(
                        'MMM D, YYYY',
                      )}
                    </p>
                  </div>
                  {selectedSubmission?.status === 'Approved' &&
                    selectedSubmission?.approveDate && (
                      <div className="flex items-center">
                        <Tooltip
                          content={
                            <DoneBy
                              doneBy={
                                selectedSubmission?.approvedByUser as
                                  | User
                                  | undefined
                              }
                              doneByType="approved"
                            />
                          }
                          contentProps={{ side: 'top' }}
                          disabled={!selectedSubmission?.approvedByUser}
                        >
                          <p className="text-sm text-slate-400">
                            Approved on:{' '}
                            {dayjs(selectedSubmission.approveDate).format(
                              'MMM D, YYYY',
                            )}
                          </p>
                        </Tooltip>
                      </div>
                    )}
                  {milestone?.status === 'Paid' && (
                    <div className="flex items-center">
                      <Tooltip
                        content={
                          <DoneBy
                            doneBy={
                              selectedSubmission?.Milestones[0]?.paidByUser as
                                | User
                                | undefined
                            }
                            doneByType="paid"
                          />
                        }
                        contentProps={{ side: 'top' }}
                        disabled={
                          !selectedSubmission?.Milestones[0]?.paidByUser
                        }
                      >
                        <p className="text-sm text-slate-400">
                          Paid on:{' '}
                          {dayjs(milestone?.paidDate).format('MMM D, YYYY')}
                        </p>
                      </Tooltip>
                      <Button
                        variant="ghost"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={handleUpdatePaymentDate}
                      >
                        <Pencil className="ml-3 h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  )}
                </div>
                <Details
                  bounty={bounty}
                  selectedSubmission={selectedSubmission}
                />
              </div>
              <div className="flex h-full min-h-0 w-1/3 flex-col border-l">
                <Tabs
                  defaultValue={activeTab}
                  className="flex h-full w-full flex-col"
                >
                  <TabsList className="grid h-auto w-full shrink-0 grid-cols-3 rounded-none">
                    <TabsTrigger
                      value="notes"
                      className={cn(
                        'flex h-auto items-center justify-center gap-1 rounded-none border-b-2 px-4 py-2 text-muted-foreground data-[state=active]:border-brand-green',
                      )}
                    >
                      <NotebookText className="size-4" />
                      {notesData?.count !== undefined ? (
                        notesData.count
                      ) : (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="comments"
                      className={cn(
                        'flex h-auto items-center justify-center gap-1 rounded-none border-b-2 px-4 py-2 text-muted-foreground data-[state=active]:border-brand-green',
                      )}
                    >
                      <MessageSquare className="size-4" />
                      {commentData?.count !== undefined ? (
                        commentData.count
                      ) : (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="activity"
                      className={cn(
                        'flex h-auto items-center justify-center gap-1 rounded-none border-b-2 px-4 py-2 text-muted-foreground data-[state=active]:border-brand-green',
                      )}
                    >
                      <Clock2 className="size-4" />
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="notes" className="p-0">
                    <div className="max-h-[30rem] overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="font-semibold">Internal Notes</span>
                        <Tooltip content="Only visible to your sponsor team. Use this space to leave internal feedback, evaluation notes, or reminders.">
                          <Info className="size-4 text-slate-300 hover:text-slate-400" />
                        </Tooltip>
                      </div>
                      <div className="mb-6 mt-4" />
                      <Comments
                        key={selectedSubmission?.id ?? ''}
                        hideCount
                        isAnnounced={false}
                        listingSlug={bounty?.slug ?? ''}
                        listingType={bounty?.type ?? ''}
                        poc={bounty?.poc as User}
                        sponsorId={bounty?.sponsorId}
                        isVerified={bounty?.sponsor?.isVerified}
                        submissionAuthor={selectedSubmission?.user as User}
                        refId={selectedSubmission?.id ?? ''}
                        refType={'SUBMISSION'}
                        type="INTERNAL_SUBMISSION_NOTES"
                        count={notesData?.count ?? 0}
                        setCount={() => {
                          refetchNotes();
                        }}
                        take={2}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="comments" className="p-0">
                    <div className="max-h-[30rem] overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="font-semibold">Public Comments</span>
                        <Tooltip content="Comments visible to the contributor and other users. Great for leaving public feedback, asking questions, or acknowledging work.">
                          <Info className="size-4 text-slate-300 hover:text-slate-400" />
                        </Tooltip>
                      </div>

                      <div className="mt-4 flex items-center gap-2 rounded-md bg-amber-50 p-2 text-amber-600">
                        <Info className="size-4 shrink-0" />
                        <p className="text-sm">
                          Visible to all contributors.
                          <br />
                          Keep it submission-related.
                        </p>
                      </div>

                      <div className="mb-6 mt-4" />
                      <Comments
                        key={selectedSubmission?.id ?? ''}
                        hideCount
                        isAnnounced={false}
                        listingSlug={bounty?.slug ?? ''}
                        listingType={bounty?.type ?? ''}
                        poc={bounty?.poc as User}
                        sponsorId={bounty?.sponsorId}
                        isVerified={bounty?.sponsor?.isVerified}
                        submissionAuthor={selectedSubmission?.user as User}
                        refId={selectedSubmission?.id ?? ''}
                        refType={'SUBMISSION'}
                        count={commentData?.count ?? 0}
                        setCount={() => {
                          refetchCommentCount();
                        }}
                        take={2}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="activity"
                    className="min-h-0 w-full flex-1 overflow-hidden p-0"
                  >
                    <div className="flex h-full flex-col gap-4 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300">
                      <div className="flex items-center gap-2 font-semibold text-slate-500">
                        Activity
                        <Tooltip content="A contributor can only see their own changes to a submission. Changes made by other contributor are not visible.">
                          <Info className="size-4 text-slate-400" />
                        </Tooltip>
                      </div>
                      <LogsTimeline
                        logs={logs?.pages.flatMap((page) => page.logs) ?? []}
                      />
                      {hasNextPage && (
                        <div className="flex justify-center">
                          <Button
                            variant="outline"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                          >
                            {isFetchingNextPage ? 'Loading...' : 'Load more'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        ) : (
          <div className="p-3">
            <p className="text-xl font-medium text-slate-500">
              No submissions found
            </p>
            <p className="text-sm text-slate-400">
              Try a different search query
            </p>
          </div>
        )}
      </div>
      <UpdatePaymentDateModal
        isOpen={isUpdateDateModalOpen}
        onClose={() => setIsUpdateDateModalOpen(false)}
        milestoneId={milestone?.id || ''}
        listingId={bounty?.id || ''}
        currentDate={dayjs(milestone?.paidDate).format('YYYY-MM-DD')}
        onSuccess={(date: string) => {
          setSelectedSubmission((prev) =>
            prev && prev.id === selectedSubmission?.id
              ? { ...prev, paymentDate: date }
              : prev,
          );
        }}
      />
    </>
  );
};
