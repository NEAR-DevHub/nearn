import dayjs from 'dayjs';
import {
  Copy,
  ExternalLink,
  Eye,
  MoreVertical,
  Pencil,
  RefreshCw,
  Trash,
  User2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { usePostHog } from 'posthog-js/react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  ColumnVisibilitySettings,
  useColumnVisibility,
} from '@/components/shared/column-visibility-settings';
import { SortableTH } from '@/components/shared/sortable-th';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KycComponent } from '@/components/ui/KycComponent';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip } from '@/components/ui/tooltip';
import { tokenList } from '@/constants/tokenList';
import { useDisclosure } from '@/hooks/use-disclosure';
import { type SubmissionWithUser } from '@/interface/submission';
import { type User } from '@/interface/user';
import { getBountyUrl, getSubmissionUrl } from '@/utils/bounty-urls';
import { cn } from '@/utils/cn';
import { truncatePublicKey } from '@/utils/truncatePublicKey';

import { SubmissionDrawer } from '@/features/listings/components/Submission/SubmissionDrawer';
import { sponsorshipSubmissionStatus } from '@/features/listings/components/SubmissionsPage/SubmissionTable';
import { getListingIcon } from '@/features/listings/utils/getListingIcon';
import { getListingTypeLabel } from '@/features/listings/utils/status';
import { ActivityHistoryMinified } from '@/features/logging/components/ActivityHistoryMinified';
import { EarnAvatar } from '@/features/talent/components/EarnAvatar';

import { type SubmissionWithListingUser } from '../queries/dashboard-submissions';
import { colorMap } from '../utils/statusColorMap';
import { ListingTh } from './ListingTable';
import { SubmissionNotesMinified } from './SubmissionNotesMinified';
import { DeleteRestoreSubmissionModal } from './Submissions/Modals/DeleteRestoreSubmissionModal';
import { EditSubmissionStatusModal } from './Submissions/Modals/EditSubmissionStatusModal';
import { DoneBy } from './Submissions/SubmissionPanel';

interface SubmissionTableProps {
  submissions: SubmissionWithListingUser[];
  currentSort: {
    column: string;
    direction: 'asc' | 'desc' | null;
  };
  onSort: (column: string, direction: 'asc' | 'desc' | null) => void;
  refetchSubmissions: () => void;
}

const thClassName =
  'text-sm font-medium capitalize tracking-tight text-slate-400';

type ColumnKey =
  | 'contributor'
  | 'title'
  | 'ask'
  | 'status'
  | 'submissionDate'
  | 'approvedDate'
  | 'paymentDate'
  | 'notes'
  | 'activity';

const columnLabels: Record<ColumnKey, string> = {
  contributor: 'Contributor',
  title: 'Listing Name',
  ask: 'Ask',
  status: 'Status',
  submissionDate: 'Submission Date',
  approvedDate: 'Approved Date',
  paymentDate: 'Last Payment Date',
  notes: 'Notes',
  activity: 'Activity',
};

export const SubmissionTh = ({
  children,
  className,
}: {
  children?: string;
  className?: string;
}) => {
  return (
    <TableHead className={cn(thClassName, className)}>{children}</TableHead>
  );
};

export const getColorStyles = (status: string | null) => {
  if (status === 'Deleted') {
    return { bg: 'bg-red-500', color: 'text-white' };
  }
  if (status && status !== 'Everything') {
    return colorMap[status as keyof typeof colorMap];
  }
  return { bg: 'bg-gray-500', color: 'text-white' };
};

export const SubmissionTable = ({
  submissions,
  currentSort,
  onSort,
  refetchSubmissions,
}: SubmissionTableProps) => {
  const posthog = usePostHog();
  const router = useRouter();
  const { data: session } = useSession();
  const isGodUser = session?.user?.role === 'GOD';
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();
  const {
    isOpen: isSubmissionDrawerOpen,
    onOpen: onSubmissionDrawerOpen,
    onClose: onSubmissionDrawerClose,
  } = useDisclosure();
  const [interactedSubmission, setInteractedSubmission] = useState<
    SubmissionWithListingUser | undefined
  >(undefined);

  const defaultVisibleColumns: Record<ColumnKey, boolean> = {
    contributor: true,
    title: true,
    ask: true,
    status: true,
    submissionDate: true,
    approvedDate: false,
    paymentDate: true,
    notes: false,
    activity: false,
  };

  const { visibleColumns, toggleColumn } = useColumnVisibility<ColumnKey>(
    'MySubmissions-Sponsor-Dashboard',
    defaultVisibleColumns,
  );

  const columnDefinitions = useMemo(
    () =>
      (Object.keys(defaultVisibleColumns) as ColumnKey[]).map((k) => ({
        key: k,
        label: columnLabels[k],
      })),
    [],
  );

  const handleOpenSubmissionDrawer = (
    submission: SubmissionWithListingUser,
  ) => {
    if (!submission.listing) return;
    setInteractedSubmission(submission);
    onEditModalClose();
    onSubmissionDrawerOpen();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success('Link Copied');
      },
      (err) => {
        console.error('Failed to copy text: ', err);
      },
    );
  };

  function handleClick(e: React.MouseEvent, href: string) {
    if (e.button === 1 || e.ctrlKey || e.metaKey) {
      window.open(href, '_blank');
      return;
    }

    router.push(href);
  }

  if (!submissions.length) return;

  return (
    <>
      <div className="w-full overflow-x-auto rounded-md border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100 hover:bg-muted">
              <SortableTH
                column="id"
                currentSort={currentSort}
                setSort={onSort}
                className={cn(thClassName)}
              >
                #
              </SortableTH>
              {visibleColumns.contributor && (
                <SortableTH
                  column="submittedBy"
                  currentSort={currentSort}
                  setSort={onSort}
                  className={cn(thClassName)}
                >
                  Contributor
                </SortableTH>
              )}
              {visibleColumns.title && (
                <>
                  <SubmissionTh />
                  <SortableTH
                    column="title"
                    currentSort={currentSort}
                    setSort={onSort}
                    className={cn(thClassName)}
                  >
                    Listing Name
                  </SortableTH>
                </>
              )}
              {visibleColumns.ask && <SubmissionTh>Ask</SubmissionTh>}
              {visibleColumns.status && (
                <SortableTH
                  column="status"
                  currentSort={currentSort}
                  setSort={onSort}
                  className={cn(thClassName)}
                >
                  Status
                </SortableTH>
              )}
              {visibleColumns.submissionDate && (
                <SortableTH
                  column="createdAt"
                  currentSort={currentSort}
                  setSort={onSort}
                  className={cn(thClassName)}
                >
                  Submission Date
                </SortableTH>
              )}
              {visibleColumns.approvedDate && (
                <SortableTH
                  column="approvedAt"
                  currentSort={currentSort}
                  setSort={onSort}
                  className={cn(thClassName)}
                >
                  Approved Date
                </SortableTH>
              )}
              {visibleColumns.paymentDate && (
                <SortableTH
                  column="paidAt"
                  currentSort={currentSort}
                  setSort={onSort}
                  className={cn(thClassName)}
                >
                  Payment Date
                </SortableTH>
              )}
              {visibleColumns.notes && (
                <ListingTh className="text-nowrap">Notes</ListingTh>
              )}
              {visibleColumns.activity && (
                <ListingTh className="text-nowrap">Activity</ListingTh>
              )}
              <ListingTh className="pl-6">Actions</ListingTh>
              <TableHead className="sticky right-0 z-50 flex items-center bg-slate-100 group-hover:bg-muted">
                <ColumnVisibilitySettings
                  columns={columnDefinitions}
                  visibleColumns={visibleColumns}
                  toggleColumn={toggleColumn}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="w-full">
            {submissions.map((submission) => {
              const submissionDate = dayjs(submission?.createdAt).format(
                "DD MMM'YY",
              );
              const milestone = submission?.Milestones[0];

              const paymentDate = milestone?.paidDate
                ? dayjs(milestone.paidDate).format("DD MMM'YY")
                : '';
              const approveDate =
                submission?.approveDate && submission.status === 'Approved'
                  ? dayjs(submission?.approveDate).format("DD MMM'YY")
                  : '';
              const listingStatus = sponsorshipSubmissionStatus(submission);
              const submissionLink = getSubmissionUrl(
                submission,
                submission?.listing,
              );
              const isUsdBased = submission?.listing?.token === 'Any';
              const token = isUsdBased
                ? submission.token
                : submission?.listing?.token;
              const tokenObject = tokenList.filter(
                (e) => e?.tokenSymbol === token,
              )[0];
              let ask = submission.ask;
              if (
                submission?.listing?.compensationType === 'fixed' &&
                submission.winnerPosition &&
                submission.isWinner
              ) {
                ask =
                  submission?.listing?.rewards?.[submission.winnerPosition] ??
                  0;
              }

              const listingLink =
                submission?.listing?.type === 'grant'
                  ? `/dashboard/grants/${submission?.listing?.slug}/applications`
                  : `/dashboard/listings/${submission?.listing?.slug}/submissions`;
              const listingSubmissionLink = `${listingLink}/${submission.sequentialId}`;
              const publicListingLink = getBountyUrl(submission?.listing);

              const textColor = getColorStyles(listingStatus).color;
              const bgColor = getColorStyles(listingStatus).bg;
              const listingType = getListingTypeLabel(
                submission?.listing?.type!,
              );

              return (
                <TableRow key={submission?.id}>
                  <TableCell
                    className="cursor-pointer"
                    onClick={(e) => handleClick(e, listingSubmissionLink)}
                    onAuxClick={(e) => handleClick(e, listingSubmissionLink)}
                  >
                    <p className="whitespace-nowrap text-sm font-medium text-slate-500">
                      {submission.sequentialId}
                    </p>
                  </TableCell>
                  {visibleColumns.contributor && (
                    <TableCell className="max-w-80 whitespace-normal break-words font-medium text-slate-700">
                      <Link
                        href={`/t/${submission?.user?.username}`}
                        className="flex items-center"
                      >
                        <EarnAvatar
                          id={submission?.user?.id}
                          avatar={submission?.user?.photo || undefined}
                        />
                        <div className="ml-2 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate whitespace-nowrap text-sm font-medium text-slate-700">
                              {submission?.user?.name}
                            </p>
                            {submission?.user?.publicKey && (
                              <KycComponent
                                address={submission.user.publicKey}
                                imageOnly
                                variant="xs"
                                listingSponsorId={
                                  submission?.listing?.sponsorId
                                }
                              />
                            )}
                          </div>
                          <p className="truncate text-xs font-medium text-slate-500">
                            {truncatePublicKey(submission.user.publicKey, 20)}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                  )}
                  {visibleColumns.title && (
                    <>
                      <TableCell className="pr-0">
                        <Tooltip content={<p>{listingType}</p>}>
                          <Link href={publicListingLink}>
                            <img
                              className="mt-1.5 h-5 min-h-5 w-5 min-w-5 flex-shrink-0 rounded-full"
                              alt={`New ${listingType}`}
                              src={getListingIcon(submission?.listing?.type!)}
                              title={listingType}
                            />
                          </Link>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link
                          href={publicListingLink}
                          className="h-full max-w-80 whitespace-normal break-words font-medium text-slate-700"
                        >
                          <p className="h-full w-full">
                            {submission?.listing?.title}
                          </p>
                        </Link>
                      </TableCell>
                    </>
                  )}
                  {visibleColumns.ask && (
                    <TableCell
                      className="min-w-[225px] cursor-pointer font-medium text-slate-700"
                      onClick={(e) => handleClick(e, listingSubmissionLink)}
                      onAuxClick={(e) => handleClick(e, listingSubmissionLink)}
                    >
                      <div className="flex w-full items-center overflow-visible">
                        <img
                          src={tokenObject?.icon}
                          alt={tokenObject?.tokenSymbol}
                          className="h-4 w-4 rounded-full"
                        />
                        <span className="ml-1 truncate text-sm">
                          {isUsdBased && '$'}
                          {ask ? ask.toLocaleString('en-us') : '0'}
                          <span className="text-slate-400">
                            {isUsdBased && ' to be paid in'}
                          </span>
                          <span
                            className={cn(
                              'ml-1',
                              !isUsdBased && 'font-semibold text-slate-400',
                            )}
                          >
                            {token}
                          </span>
                        </span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.status && (
                    <TableCell
                      className="cursor-pointer items-center py-2"
                      onClick={(e) => handleClick(e, listingSubmissionLink)}
                      onAuxClick={(e) => handleClick(e, listingSubmissionLink)}
                    >
                      <p
                        className={cn(
                          'inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium',
                          textColor,
                          bgColor,
                        )}
                      >
                        {listingStatus}
                      </p>
                    </TableCell>
                  )}
                  {visibleColumns.submissionDate && (
                    <TableCell
                      className="cursor-pointer items-center py-2"
                      onClick={(e) => handleClick(e, listingSubmissionLink)}
                      onAuxClick={(e) => handleClick(e, listingSubmissionLink)}
                    >
                      <p className="whitespace-nowrap text-sm font-medium text-slate-500">
                        {submissionDate}
                      </p>
                    </TableCell>
                  )}
                  {visibleColumns.approvedDate && (
                    <TableCell
                      className="cursor-pointer items-center py-2"
                      onClick={(e) => handleClick(e, listingSubmissionLink)}
                      onAuxClick={(e) => handleClick(e, listingSubmissionLink)}
                    >
                      <Tooltip
                        disabled={!submission?.approvedByUser}
                        content={
                          <DoneBy
                            doneBy={
                              submission?.approvedByUser as User | undefined
                            }
                            doneByType="approved"
                          />
                        }
                      >
                        <p className="whitespace-nowrap text-sm font-medium text-slate-500">
                          {approveDate}
                        </p>
                      </Tooltip>
                    </TableCell>
                  )}
                  {visibleColumns.paymentDate && (
                    <TableCell
                      className="cursor-pointer"
                      onClick={(e) => handleClick(e, listingSubmissionLink)}
                      onAuxClick={(e) => handleClick(e, listingSubmissionLink)}
                    >
                      <Tooltip
                        disabled={!milestone?.paidByUser}
                        content={
                          <DoneBy
                            doneBy={milestone?.paidByUser as User | undefined}
                            doneByType="paid"
                          />
                        }
                      >
                        <p className="whitespace-nowrap text-sm font-medium text-slate-500">
                          {paymentDate}
                        </p>
                      </Tooltip>
                    </TableCell>
                  )}
                  {visibleColumns.notes && (
                    <TableCell className="items-center py-2">
                      <SubmissionNotesMinified submission={submission} />
                    </TableCell>
                  )}
                  {visibleColumns.activity && (
                    <TableCell className="items-center py-2">
                      <ActivityHistoryMinified
                        id={submission.id}
                        refType="submission"
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ph-no-capture text-[13px] font-medium text-black"
                    >
                      <Link
                        href={listingSubmissionLink}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Submission
                      </Link>
                    </Button>
                  </TableCell>
                  <TableCell className="px-0 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="hover:bg-slate-100"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="max-w-60">
                        <DropdownMenuItem
                          className="cursor-pointer text-sm font-medium text-slate-500"
                          onClick={() => {
                            posthog.capture('sponsor_view_profile');
                            router.push(`/t/${submission?.user.username}`);
                          }}
                        >
                          <User2 className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>

                        {(submission?.listing?.type === 'sponsorship' ||
                          (submission?.listing?.type === 'bounty' &&
                            submission?.listing?.isWinnersAnnounced)) && (
                          <>
                            <DropdownMenuItem
                              className="cursor-pointer text-sm font-medium text-slate-500"
                              onClick={() => {
                                posthog.capture(
                                  'sponsor_public_submission_view',
                                );
                                router.push(submissionLink);
                              }}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Public Submission
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="cursor-pointer text-sm font-medium text-slate-500"
                              onClick={() => {
                                copyToClipboard(submissionLink);
                              }}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Link
                            </DropdownMenuItem>
                            {milestone?.status === 'Paid' &&
                              milestone?.paymentDetails?.link && (
                                <DropdownMenuItem
                                  className="cursor-pointer text-sm font-medium text-slate-500"
                                  onClick={() => {
                                    copyToClipboard(
                                      milestone?.paymentDetails?.link || '',
                                    );
                                  }}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy Payment Link
                                </DropdownMenuItem>
                              )}
                          </>
                        )}
                        {isGodUser && submission.listing.isActive && (
                          <>
                            {!submission.isArchived && (
                              <DropdownMenuItem
                                className="cursor-pointer text-sm font-medium text-slate-500"
                                onClick={() => {
                                  setInteractedSubmission(submission);
                                  onEditModalOpen();
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Status
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className={cn(
                                'cursor-pointer text-sm font-medium text-slate-500',
                                submission.isArchived
                                  ? 'hover:text-brand-green'
                                  : 'hover:text-destructive',
                              )}
                              onClick={() => {
                                setInteractedSubmission(submission);
                                onDeleteModalOpen();
                              }}
                            >
                              {submission.isArchived || !submission.isActive ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Restore Submission
                                </>
                              ) : (
                                <>
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete Submission
                                </>
                              )}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <EditSubmissionStatusModal
        isOpen={isEditModalOpen}
        onClose={onEditModalClose}
        submission={interactedSubmission}
        onSuccess={refetchSubmissions}
        onEditFullSubmission={
          handleOpenSubmissionDrawer as (submission: SubmissionWithUser) => void
        }
      />
      <DeleteRestoreSubmissionModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        submission={interactedSubmission}
        onSuccess={refetchSubmissions}
      />
      {interactedSubmission?.listing && isGodUser && isSubmissionDrawerOpen && (
        <SubmissionDrawer
          submission={interactedSubmission}
          isOpen={isSubmissionDrawerOpen}
          onClose={() => {
            onSubmissionDrawerClose();
            refetchSubmissions();
          }}
          editMode={true}
          listing={interactedSubmission.listing}
          isGodMode={isGodUser}
          showEasterEgg={() => {}}
          onSurveyOpen={() => {}}
        />
      )}
    </>
  );
};
