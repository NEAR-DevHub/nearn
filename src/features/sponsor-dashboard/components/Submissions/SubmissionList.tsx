import { type SubmissionLabels } from '@prisma/client';
import { ChevronDown, Pencil, RefreshCw, Search, Trash } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { type Dispatch, type SetStateAction, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { KycComponent } from '@/components/ui/KycComponent';
import { useDisclosure } from '@/hooks/use-disclosure';
import type { SubmissionWithUser } from '@/interface/submission';
import { cn } from '@/utils/cn';
import { nthLabelGenerator } from '@/utils/rank';

import { SubmissionDrawer } from '@/features/listings/components/Submission/SubmissionDrawer';
import { sponsorshipSubmissionStatus } from '@/features/listings/components/SubmissionsPage/SubmissionTable';
import { type Listing } from '@/features/listings/types';
import { EarnAvatar } from '@/features/talent/components/EarnAvatar';

import { type SubmissionWithListingUser } from '../../queries/dashboard-submissions';
import { colorMap } from '../../utils/statusColorMap';
import { DeleteRestoreSubmissionModal } from './Modals/DeleteRestoreSubmissionModal';
import { EditSubmissionStatusModal } from './Modals/EditSubmissionStatusModal';

interface Props {
  listing?: Listing;
  submissions: SubmissionWithListingUser[];
  setSearchText: (text: string) => void;
  type?: string;
  filterLabel: SubmissionLabels | 'Paid' | 'Approved' | 'Rejected' | undefined;
  setFilterLabel: Dispatch<
    SetStateAction<
      SubmissionLabels | 'Paid' | 'Approved' | 'Rejected' | undefined
    >
  >;
  selectedSubmission: SubmissionWithListingUser | undefined;
  setSelectedSubmission: (submission: SubmissionWithListingUser) => void;
  isAllToggled?: boolean;
  refetchSubmissions: () => void;
}

export const SubmissionList = ({
  listing,
  submissions,
  setSearchText,
  type,
  filterLabel,
  setFilterLabel,
  selectedSubmission,
  setSelectedSubmission,
  refetchSubmissions,
}: Props) => {
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
    SubmissionWithUser | undefined
  >(undefined);
  const [submissionDrawerId, setSubmissionDrawerId] = useState<
    string | undefined
  >(undefined);

  const handleOpenSubmissionDrawer = (submission: SubmissionWithUser) => {
    if (!listing) return;
    setInteractedSubmission(submission);
    setSubmissionDrawerId(submission.id);
    onEditModalClose();
    onSubmissionDrawerOpen();
  };

  let bg, color;

  if (filterLabel) {
    ({ bg, color } = colorMap[filterLabel]);
  }
  const getSubmissionLabel = (submission: SubmissionWithUser) => {
    if (submission.isArchived) {
      return 'Deleted';
    }
    if (
      submission?.isWinner &&
      submission?.winnerPosition &&
      type === 'bounty'
    ) {
      return nthLabelGenerator(submission.winnerPosition, false);
    } else {
      return sponsorshipSubmissionStatus(submission);
    }
  };

  const filters = [
    'New',
    'Approved',
    'InProgress',
    'Paid',
    'Shortlisted',
    'Reviewed',
    'Cancelled',
    'Rejected',
    'Spam',
  ] as const;

  return (
    <div className="flex h-full w-full flex-col rounded-l-xl border border-slate-200 bg-white">
      <div className="flex cursor-pointer flex-col items-center justify-between gap-4 border-b border-slate-200 px-4 py-3">
        <div className="flex w-full items-center justify-between gap-4 py-[3px]">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="placeholder:text-md h-12 border-slate-200 bg-white pl-9 placeholder:font-medium placeholder:text-slate-400 focus-visible:ring-black"
              key={'text-search'}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search Submissions"
              type="text"
            />
          </div>
        </div>
        <div className="flex w-full cursor-default items-center justify-between">
          <p className="text-xs text-slate-500">Filter By</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="h-auto w-32 border border-slate-300 bg-transparent px-2 py-1 font-medium capitalize text-slate-500 hover:border-brand-green hover:bg-transparent"
                variant="outline"
              >
                <span
                  className={cn(
                    'mr-auto inline-flex w-fit whitespace-nowrap rounded-full px-3 text-center text-[10px] capitalize',
                    bg,
                    color,
                  )}
                >
                  {filterLabel
                    ? filterLabel.replace(/([A-Z])/g, ' $1').trim()
                    : 'Select Option'}
                </span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="z-[70] max-w-60 bg-white"
            >
              <DropdownMenuItem
                className="focus:bg-slate-100"
                onClick={() => setFilterLabel(undefined)}
              >
                <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-3 text-center text-[10px] capitalize">
                  Select Option
                </span>
              </DropdownMenuItem>

              {filters.map((filter) => (
                <DropdownMenuItem
                  key={filter}
                  className="focus:bg-slate-100"
                  onClick={() => setFilterLabel(filter as SubmissionLabels)}
                >
                  <span
                    className={cn(
                      'inline-flex whitespace-nowrap rounded-full bg-slate-100 px-3 text-center text-[10px] capitalize',
                      colorMap[filter as keyof typeof colorMap].bg,
                      colorMap[filter as keyof typeof colorMap].color,
                    )}
                  >
                    {filter.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {submissions.map((submission) => {
          const label = getSubmissionLabel(submission);
          const { bg, color } =
            colorMap[label as keyof typeof colorMap] ?? colorMap.winner;
          return (
            <div
              key={submission?.id}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-4 border-b border-slate-200 px-4 py-2',
                'hover:bg-slate-100',
                selectedSubmission?.id === submission?.id
                  ? 'bg-slate-100'
                  : 'bg-transparent',
              )}
              onClick={() => {
                setSelectedSubmission(submission);
              }}
            >
              <div className="flex items-center gap-2">
                <p className="w-6 shrink-0 text-xs text-slate-500">
                  {submission.sequentialId}
                </p>
                <EarnAvatar
                  className="h-8 w-8 shrink-0"
                  id={submission?.user?.id}
                  avatar={submission?.user?.photo || undefined}
                />
                <div className="w-28">
                  <div className="flex items-center gap-2">
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-slate-700">
                      {submission?.user?.name}
                    </p>
                    <KycComponent
                      address={submission?.user?.publicKey}
                      imageOnly
                      variant="xs"
                      listingSponsorId={submission?.listing?.sponsorId}
                    />
                  </div>
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-slate-500">
                    {submission?.user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <span
                  className={cn(
                    'inline-flex whitespace-nowrap rounded-full px-3 py-1 text-center text-[10px] capitalize',
                    bg,
                    color,
                  )}
                >
                  {label.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                {isGodUser && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={'ml-1 h-6 w-6 p-1 text-slate-500'}
                      disabled={submission.isArchived}
                      onClick={() => {
                        setInteractedSubmission(submission);
                        onEditModalOpen();
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'ml-1 h-6 w-6 p-1 text-slate-500 hover:text-destructive',
                        submission.isArchived && 'hover:text-brand-green',
                      )}
                      onClick={() => {
                        setInteractedSubmission(submission);
                        onDeleteModalOpen();
                      }}
                    >
                      {submission.isArchived || !submission.isActive ? (
                        <RefreshCw className="h-3 w-3" />
                      ) : (
                        <Trash className="h-3 w-3" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <EditSubmissionStatusModal
        isOpen={isEditModalOpen}
        onClose={onEditModalClose}
        submission={interactedSubmission}
        onSuccess={() => refetchSubmissions()}
        onEditFullSubmission={handleOpenSubmissionDrawer}
      />
      <DeleteRestoreSubmissionModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        submission={interactedSubmission}
        onSuccess={() => refetchSubmissions()}
      />
      {listing && submissionDrawerId && isGodUser && (
        <SubmissionDrawer
          submission={interactedSubmission}
          isOpen={isSubmissionDrawerOpen}
          onClose={() => {
            setSubmissionDrawerId(undefined);
            onSubmissionDrawerClose();
            refetchSubmissions();
          }}
          editMode={true}
          listing={listing}
          isGodMode={isGodUser}
          showEasterEgg={() => {}}
          onSurveyOpen={() => {}}
        />
      )}
    </div>
  );
};
