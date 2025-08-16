import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { TooltipArrow } from '@radix-ui/react-tooltip';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import {
  ArrowRight,
  Copy,
  DollarSign,
  ExternalLink,
  Info,
  Link2,
  Loader2,
  Pencil,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, {
  type Dispatch,
  Fragment,
  type SetStateAction,
  useState,
} from 'react';
import { MdOutlineAccountBalanceWallet, MdOutlineMail } from 'react-icons/md';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { KycComponent } from '@/components/ui/KycComponent';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tooltip } from '@/components/ui/tooltip';
import { tokenList } from '@/constants/tokenList';
import { useClipboard } from '@/hooks/use-clipboard';
import type { User } from '@/interface/user';
import { getSubmissionUrl } from '@/utils/bounty-urls';
import { cn } from '@/utils/cn';
import { dayjs } from '@/utils/dayjs';
import { getURLSanitized } from '@/utils/getURLSanitized';
import { truncatePublicKey } from '@/utils/truncatePublicKey';
import { truncateString } from '@/utils/truncateString';

import { Comments } from '@/features/comments/components/Comments';
import { useCommentCount } from '@/features/comments/queries/comment-count';
import PaymentDetailsModal from '@/features/listings/components/PaymentDetailsModal';
import type { Listing } from '@/features/listings/types';
import LogsTimeline from '@/features/logging/components/LogsTimeline';
import { useGetLogsInfinite } from '@/features/logging/queries';
import {
  Discord,
  GitHub,
  Linkedin,
  Telegram,
  Twitter,
  Website,
} from '@/features/social/components/SocialIcons';
import { EarnAvatar } from '@/features/talent/components/EarnAvatar';
import TreasuryStatus from '@/features/treasury/components/TreasuryStatus';

import { treasuryProposalStatusQuery } from '../../../treasury/queries/treasuryProposalStatus';
import { selectedSubmissionAtom } from '../../atoms';
import { type SubmissionWithListingUser } from '../../queries/dashboard-submissions';
import { Details } from './Details';
import AddManualPaymentModal from './Modals/AddManualPaymentModal';
import NearTreasuryPaymentModal from './Modals/NearTreasuryPaymentModal';
import { SelectWinnersGuide } from './Modals/SelectWinnersGuide';
import { UpdatePaymentDateModal } from './Modals/UpdateDateModal';
import UpdateManualPaymentModal from './Modals/UpdateManualPaymentModal';
import { Notes } from './Notes';
import { SelectLabel } from './SelectLabel';
import { SelectWinner } from './SelectWinner';

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
  isMultiSelectOn?: boolean;
  onVerifyPayment: () => void;
}

interface PaymentButtonProps {
  treasury?: {
    link?: string;
    proposalId?: number;
    dao?: string;
  };
  proposalStatus?: string;
  isLoadingProposalStatus: boolean;
  onVerifyPayment: () => void;
  setIsNearTreasuryPaymentModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsAddManualPaymentModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const PaymentButton = ({
  treasury,
  proposalStatus,
  isLoadingProposalStatus,
  onVerifyPayment,
  setIsNearTreasuryPaymentModalOpen,
  setIsAddManualPaymentModalOpen,
}: PaymentButtonProps) => {
  if (isLoadingProposalStatus) {
    return <></>;
  }

  if (proposalStatus === 'InProgress' || proposalStatus === 'Approved') {
    return (
      <Link
        href={getURLSanitized(treasury?.link || '')}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="outline"
          className="ph-no-capture min-w-[120px] text-slate-500"
        >
          View Pending Request
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    );
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Button className="ph-no-capture min-w-[120px] disabled:cursor-not-allowed">
          <DollarSign className="mr-2 h-4 w-4" />
          Complete Payment
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="flex w-full max-w-md flex-col gap-2 p-2"
      >
        <Button
          onClick={() => onVerifyPayment()}
          variant="ghost"
          className="flex h-full w-full items-start rounded-sm px-4 py-3"
        >
          <Link2 className="mr-3 h-4 w-4" />
          <div className="flex flex-col text-left">
            <p>Add Payment Link</p>
            <p className="text-wrap text-xs text-muted-foreground">
              Pay the contributor using your preferred method, then paste the
              transaction link here.
            </p>
          </div>
        </Button>
        <Button
          onClick={() => setIsAddManualPaymentModalOpen(true)}
          variant="ghost"
          className="flex h-full w-full items-start rounded-sm px-4 py-3"
        >
          <DollarSign className="mr-3 h-4 w-4" />
          <div className="flex flex-col text-left">
            <p>Add Manual Payment</p>
            <p className="text-wrap text-xs text-muted-foreground">
              Make the payment via your preferred channel, then enter the
              transaction manually.
            </p>
          </div>
        </Button>
        <Button
          onClick={() => setIsNearTreasuryPaymentModalOpen(true)}
          variant="ghost"
          className="flex h-full w-full items-start justify-start rounded-sm pb-3 pl-2 pr-4 pt-[10px]"
        >
          <Image
            src="/assets/NEARTreasuryLogo.svg"
            alt="Near Treasury Logo"
            width={24}
            height={24}
            className="mr-3"
          />
          <div className="flex flex-col text-left">
            <p>Pay with NEAR Treasury</p>
            <p className="text-wrap text-xs text-muted-foreground">
              Create a payment request through NEAR Treasury and approve it
              on-chain.
            </p>
          </div>
        </Button>
      </PopoverContent>
    </Popover>
  );
};

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

type ActionTab = 'notes' | 'comments';

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
}: Props) => {
  const afterAnnounceDate =
    bounty?.type === 'hackathon'
      ? dayjs().isAfter(bounty?.Hackathon?.announceDate)
      : true;

  const isProject = bounty?.type === 'project';
  const isSponsorship = bounty?.type === 'sponsorship';
  const [selectedSubmission, setSelectedSubmission] = useAtom(
    selectedSubmissionAtom,
  );
  const { data: commentData, refetch: refetchCommentCount } = useCommentCount(
    selectedSubmission?.id,
  );
  const {
    data: logs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetLogsInfinite({
    refType: 'submission',
    refId: selectedSubmission?.id,
  });
  const [activeTab, setActiveTab] = useState<ActionTab>('notes');

  const { onCopy: onCopyEmail } = useClipboard(
    selectedSubmission?.user?.email || '',
  );

  const { onCopy: onCopyPublicKey } = useClipboard(
    selectedSubmission?.user?.publicKey || '',
  );

  const { onCopy: onCopySubmissionLink } = useClipboard(
    getSubmissionUrl(selectedSubmission, bounty),
  );

  const [isNearTreasuryPaymentModalOpen, setIsNearTreasuryPaymentModalOpen] =
    useState(false);
  const [isAddManualPaymentModalOpen, setIsAddManualPaymentModalOpen] =
    useState(false);
  const [isUpdateManualPaymentModalOpen, setIsUpdateManualPaymentModalOpen] =
    useState(false);
  const [isPaymentDetailsModalOpen, setIsPaymentDetailsModalOpen] =
    useState(false);

  const handleCopySubmissionLink = () => {
    if (selectedSubmission?.id) {
      onCopySubmissionLink();
      toast.success('Submission link copied', {
        duration: 1500,
      });
    }
  };
  const handleCopyEmail = () => {
    if (selectedSubmission?.user?.email) {
      onCopyEmail();
      toast.success('Email copied', {
        duration: 1500,
      });
    }
  };

  const handleCopyPublicKey = () => {
    if (selectedSubmission?.user?.publicKey) {
      onCopyPublicKey();
      toast.success('Wallet address copied', {
        duration: 1500,
      });
    }
  };
  const [isUpdateDateModalOpen, setIsUpdateDateModalOpen] = useState(false);

  const handleUpdatePaymentDate = () => {
    setIsUpdateDateModalOpen(true);
  };

  const treasury = selectedSubmission?.paymentDetails?.treasury;

  const { data: proposalStatus, isLoading: isLoadingProposalStatus } = useQuery(
    treasuryProposalStatusQuery(treasury?.dao, treasury?.proposalId ?? 0),
  );

  const socials = [
    {
      icon: (
        <Telegram
          key="telegram"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={selectedSubmission?.user?.telegram || ''}
        />
      ),
      isVisible: !!selectedSubmission?.user?.telegram,
    },
    {
      icon: (
        <Twitter
          key="twitter"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={selectedSubmission?.user?.twitter || ''}
        />
      ),
      isVisible: !!selectedSubmission?.user?.twitter,
    },
    {
      icon: (
        <Discord
          key="discord"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={selectedSubmission?.user?.discord || ''}
        />
      ),
      isVisible: !!selectedSubmission?.user?.discord,
    },
    {
      icon: (
        <Linkedin
          key="linkedin"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={selectedSubmission?.user?.linkedin || ''}
        />
      ),
      isVisible: !!selectedSubmission?.user?.linkedin,
    },
    {
      icon: (
        <GitHub
          key="github"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={selectedSubmission?.user?.github || ''}
        />
      ),
      isVisible: !!selectedSubmission?.user?.github,
    },
    {
      icon: (
        <Website
          key="website"
          className="h-[0.9rem] w-[0.9rem] text-slate-600"
          link={selectedSubmission?.user?.website || ''}
        />
      ),
      isVisible: !!selectedSubmission?.user?.website,
    },
  ];

  const isUsdBased = bounty?.token === 'Any';
  const tokenName = isUsdBased ? selectedSubmission?.token : bounty?.token;
  const token = tokenList.find((s) => s.tokenSymbol === tokenName);

  let amount =
    bounty?.compensationType === 'fixed' ? 0 : selectedSubmission?.ask;
  if (selectedSubmission?.isWinner && selectedSubmission?.winnerPosition) {
    amount = bounty?.rewards?.[selectedSubmission?.winnerPosition] ?? 0;
  }

  return (
    <>
      <div className="sticky top-[3rem] w-full">
        {submissions.length ? (
          <>
            <div className="rounded-t-xl border-b border-slate-200 bg-white py-1">
              <div className="flex w-full items-center justify-between px-4 pt-3">
                <div className="flex w-full items-center gap-2">
                  <EarnAvatar
                    className="h-10 w-10"
                    id={selectedSubmission?.user?.id}
                    avatar={selectedSubmission?.user?.photo || undefined}
                  />
                  <div>
                    <p className="flex w-full items-center whitespace-nowrap font-medium text-slate-900">
                      {selectedSubmission?.user?.name}
                      <span className="text-slate-500">
                        {`'s Submission #${selectedSubmission?.sequentialId}`}
                      </span>
                      <Button
                        variant="ghost"
                        className="mb-1 ml-2 h-4 w-4 p-0 text-slate-500 hover:text-slate-500"
                        onClick={handleCopySubmissionLink}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Link
                        href={getURLSanitized(
                          getSubmissionUrl(selectedSubmission, bounty),
                        )}
                        target="_blank"
                      >
                        <ExternalLink className="mb-1 ml-2 h-4 w-4 text-slate-500" />
                      </Link>
                    </p>
                    <Link
                      className="flex w-full items-center whitespace-nowrap text-xs font-medium text-slate-500"
                      href={`/t/${selectedSubmission?.user?.username}`}
                    >
                      View Profile{' '}
                      <ArrowRight className="inline-block h-3 w-3" />
                    </Link>
                  </div>
                </div>
                <div
                  className={
                    'ph-no-capture flex w-full items-center justify-end gap-2'
                  }
                >
                  {selectedSubmission?.isWinner &&
                    selectedSubmission?.winnerPosition &&
                    !selectedSubmission?.isPaid &&
                    (bounty?.isWinnersAnnounced || isSponsorship) && (
                      <PaymentButton
                        treasury={treasury}
                        proposalStatus={proposalStatus}
                        isLoadingProposalStatus={isLoadingProposalStatus}
                        onVerifyPayment={onVerifyPayment}
                        setIsNearTreasuryPaymentModalOpen={
                          setIsNearTreasuryPaymentModalOpen
                        }
                        setIsAddManualPaymentModalOpen={
                          setIsAddManualPaymentModalOpen
                        }
                      />
                    )}
                  {selectedSubmission?.status === 'Pending' &&
                    !selectedSubmission?.isPaid && (
                      <SelectLabel listingSlug={bounty?.slug!} />
                    )}
                  {selectedSubmission?.isWinner &&
                    selectedSubmission?.winnerPosition &&
                    selectedSubmission?.isPaid &&
                    selectedSubmission?.paymentDetails?.link && (
                      <Tooltip
                        content="Paid via external link"
                        contentProps={{ side: 'top' }}
                      >
                        <Button
                          className="text-slate-500"
                          onClick={() => {
                            window.open(
                              getURLSanitized(
                                selectedSubmission?.paymentDetails?.link ?? '',
                              ),
                              '_blank',
                            );
                          }}
                          size="default"
                          variant="outline"
                        >
                          <Link2 className="mr-2 h-4 w-4" />
                          View Payment
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </Tooltip>
                    )}

                  {selectedSubmission?.isWinner &&
                    selectedSubmission?.winnerPosition &&
                    selectedSubmission?.isPaid &&
                    !selectedSubmission?.paymentDetails?.link &&
                    !selectedSubmission?.paymentDetails?.manual && (
                      <Button
                        className="text-slate-500"
                        disabled
                        size="default"
                        variant="outline"
                      >
                        <p className="mr-2">Marked as paid</p>
                      </Button>
                    )}

                  {selectedSubmission?.isWinner &&
                    selectedSubmission?.winnerPosition &&
                    selectedSubmission?.isPaid &&
                    selectedSubmission?.paymentDetails?.manual && (
                      <Tooltip
                        content="Paid manually"
                        contentProps={{ side: 'top' }}
                      >
                        <Button
                          className="text-slate-500"
                          onClick={() => setIsPaymentDetailsModalOpen(true)}
                          size="default"
                          variant="outline"
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          View Payment
                        </Button>
                      </Tooltip>
                    )}

                  {selectedSubmission?.isWinner &&
                    selectedSubmission?.winnerPosition &&
                    selectedSubmission?.isPaid &&
                    selectedSubmission?.paymentDetails?.treasury?.link && (
                      <Tooltip
                        content="Paid via NEAR Treasury"
                        contentProps={{ side: 'top' }}
                      >
                        <Button
                          className="text-slate-500"
                          onClick={() => {
                            window.open(
                              getURLSanitized(
                                selectedSubmission?.paymentDetails?.treasury
                                  ?.link ?? '',
                              ),
                              '_blank',
                            );
                          }}
                          size="default"
                          variant="outline"
                        >
                          <Image
                            src="/assets/NEARTreasuryLogo.svg"
                            alt="NEAR Treasury"
                            width={16}
                            height={16}
                            className="mr-2"
                          />
                          View Payment
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </Tooltip>
                    )}

                  {selectedSubmission?.isWinner &&
                    selectedSubmission?.winnerPosition &&
                    selectedSubmission?.isPaid &&
                    selectedSubmission?.paymentDetails?.link && (
                      <Tooltip
                        content="Paid manually"
                        contentProps={{ side: 'top' }}
                      >
                        <Button
                          className="text-slate-500"
                          onClick={() => setIsPaymentDetailsModalOpen(true)}
                          size="default"
                          variant="outline"
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          View Payment
                        </Button>
                      </Tooltip>
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
                              content={
                                !bounty?.isWinnersAnnounced ? (
                                  <>
                                    Allocate the whole prize pool or edit the
                                    listing to shrink it before you can continue
                                  </>
                                ) : (
                                  <>
                                    You cannot change the winners once the
                                    results are published!
                                    <TooltipArrow />
                                  </>
                                )
                              }
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
              </div>
              <div className="ml-auto flex w-fit px-4 py-1 text-xs">
                <TreasuryStatus
                  treasury={treasury}
                  submissionId={selectedSubmission?.id ?? ''}
                  submissionIsPaid={selectedSubmission?.isPaid ?? false}
                  updateSubmission={(status) => {
                    setSelectedSubmission((prev) =>
                      prev && prev.id === selectedSubmission?.id
                        ? {
                            ...prev,
                            isPaid: true,
                            paymentDetails: {
                              ...(status === 'Approved'
                                ? {
                                    link: prev.paymentDetails?.treasury?.link,
                                  }
                                : {
                                    treasury: {
                                      ...prev.paymentDetails?.treasury,
                                      synced: true,
                                    },
                                  }),
                            },
                          }
                        : prev,
                    );
                  }}
                />
              </div>

              <div className="flex items-center justify-between px-4 py-2">
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

                  {selectedSubmission?.user?.publicKey && (
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
                          aria-label={`Copy public key: ${truncatePublicKey(selectedSubmission.user.publicKey, 20)}`}
                        >
                          <MdOutlineAccountBalanceWallet />
                          <p>
                            {truncatePublicKey(
                              selectedSubmission.user.publicKey,
                              20,
                            )}
                          </p>
                        </div>
                      </Tooltip>
                      <div className="mb-0.5">
                        <KycComponent
                          address={selectedSubmission?.user?.publicKey}
                          imageOnly
                          listingSponsorId={bounty?.sponsorId}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-5">
                  {selectedSubmission?.user?.email && (
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
                        aria-label={`Copy email: ${selectedSubmission.user.email}`}
                      >
                        <MdOutlineMail />
                        {truncateString(selectedSubmission.user.email, 36)}
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

            <div className="flex w-full">
              <div className="w-2/3">
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
                  {selectedSubmission?.isPaid &&
                    selectedSubmission?.paymentDate && (
                      <div className="flex items-center">
                        <Tooltip
                          content={
                            <DoneBy
                              doneBy={
                                selectedSubmission?.paidByUser as
                                  | User
                                  | undefined
                              }
                              doneByType="paid"
                            />
                          }
                          contentProps={{ side: 'top' }}
                          disabled={!selectedSubmission?.paidByUser}
                        >
                          <p className="text-sm text-slate-400">
                            Paid on:{' '}
                            {dayjs(selectedSubmission.paymentDate).format(
                              'MMM D, YYYY',
                            )}
                          </p>
                        </Tooltip>
                        <Button
                          variant="ghost"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={
                            selectedSubmission?.paymentDetails?.manual
                              ? () => setIsUpdateManualPaymentModalOpen(true)
                              : handleUpdatePaymentDate
                          }
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
              <div className="w-1/3 border-l">
                <Tabs
                  defaultValue="notes"
                  value={activeTab}
                  onValueChange={(tab) => setActiveTab(tab as ActionTab)}
                  className="w-full"
                >
                  <TabsList className="grid h-auto w-full grid-cols-3 rounded-none">
                    <TabsTrigger
                      value="notes"
                      className={cn(
                        'h-auto rounded-none border-b-2 px-4 py-2 text-muted-foreground data-[state=active]:border-brand-green',
                      )}
                    >
                      Notes
                    </TabsTrigger>
                    <TabsTrigger
                      value="comments"
                      className={cn(
                        'flex h-auto items-center justify-center gap-2 rounded-none border-b-2 px-4 py-2 text-muted-foreground data-[state=active]:border-brand-green',
                      )}
                    >
                      Comments:{' '}
                      {commentData?.count !== undefined ? (
                        commentData.count
                      ) : (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="activity"
                      className={cn(
                        'h-auto rounded-none border-b-2 px-4 py-2 text-muted-foreground data-[state=active]:border-brand-green',
                      )}
                    >
                      Activity
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="notes" className="p-0">
                    <div className="max-h-[32rem] overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300">
                      <Notes
                        key={selectedSubmission?.id}
                        submissionId={selectedSubmission?.id ?? ''}
                        initialNotes={selectedSubmission?.notes}
                        slug={bounty?.slug}
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
                      <div className="mb-6 mt-4 border-b border-slate-200" />
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

                  <TabsContent value="activity" className="p-0">
                    <div className="flex max-h-[30rem] flex-col gap-4 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300">
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
        submissionId={selectedSubmission?.id || ''}
        listingId={bounty?.id || ''}
        currentDate={selectedSubmission?.paymentDate}
        onSuccess={(date: string) => {
          setSelectedSubmission((prev) =>
            prev && prev.id === selectedSubmission?.id
              ? { ...prev, paymentDate: date }
              : prev,
          );
        }}
      />

      {selectedSubmission && (
        <NearTreasuryPaymentModal
          isOpen={isNearTreasuryPaymentModalOpen}
          onClose={() => setIsNearTreasuryPaymentModalOpen(false)}
          submissionId={selectedSubmission?.id || ''}
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
      )}

      {selectedSubmission && (
        <AddManualPaymentModal
          isOpen={isAddManualPaymentModalOpen}
          onClose={() => setIsAddManualPaymentModalOpen(false)}
          submissionId={selectedSubmission?.id || ''}
          onSuccess={() => {
            setSelectedSubmission((prev) =>
              prev && prev.id === selectedSubmission?.id
                ? { ...prev, isPaid: true }
                : prev,
            );
          }}
        />
      )}

      {selectedSubmission && (
        <UpdateManualPaymentModal
          isOpen={isUpdateManualPaymentModalOpen}
          onClose={() => setIsUpdateManualPaymentModalOpen(false)}
          submissionId={selectedSubmission?.id || ''}
          currentPaymentData={selectedSubmission?.paymentDetails?.manual as any}
          onSuccess={() => {
            // Optionally refetch submission data -> if needed
          }}
        />
      )}

      {selectedSubmission?.paymentDetails?.manual && (
        <PaymentDetailsModal
          isOpen={isPaymentDetailsModalOpen}
          onClose={() => setIsPaymentDetailsModalOpen(false)}
          paymentData={selectedSubmission.paymentDetails.manual as any}
          submissionId={selectedSubmission.id}
          isOwner={false}
        />
      )}
    </>
  );
};
