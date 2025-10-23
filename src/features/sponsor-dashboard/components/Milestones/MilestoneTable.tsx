import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import {
  ColumnVisibilitySettings,
  useColumnVisibility,
} from '@/components/shared/column-visibility-settings';
import { SortableTH } from '@/components/shared/sortable-th';
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
import { type MilestoneWithUser } from '@/interface/submission';
import type { User } from '@/interface/user';
import { cn } from '@/utils/cn';
import { dayjs } from '@/utils/dayjs';

import { type Listing } from '@/features/listings/types';
import { ActivityHistoryMinified } from '@/features/logging/components/ActivityHistoryMinified';
import { type SubmissionWithListingUser } from '@/features/sponsor-dashboard/queries/dashboard-submissions';

import { colorMap } from '../../utils/statusColorMap';
import { VerifyPaymentModal } from '../Modals/VerifyPayment';
import AddManualPaymentModal from '../Submissions/Modals/AddManualPaymentModal';
import NearTreasuryPaymentModal from '../Submissions/Modals/NearTreasuryPaymentModal';
import { DoneBy } from '../Submissions/SubmissionPanel';
import MilestoneActionButton from './MilestoneActionButton';

interface Props {
  listing: Listing;
  submission: SubmissionWithListingUser;
  className?: string;
}

const thClassName =
  'text-sm font-medium capitalize tracking-tight text-slate-400';

type ColumnKey =
  | 'index'
  | 'dueDate'
  | 'title'
  | 'description'
  | 'amount'
  | 'status'
  | 'approvedDate'
  | 'paymentDate'
  | 'activity';

const columnLabels: Record<ColumnKey, string> = {
  index: '#',
  dueDate: 'Due Date',
  title: 'Title',
  description: 'Description',
  amount: 'Amount',
  status: 'Status',
  approvedDate: 'Approved Date',
  paymentDate: 'Payment Date',
  activity: 'Activity History',
};

export default function MilestoneTable({
  listing,
  submission,
  className,
}: Props) {
  const queryClient = useQueryClient();

  const [currentSort, setCurrentSort] = useState<{
    column: string;
    direction: 'asc' | 'desc' | null;
  }>({ column: '', direction: null });

  const [selectedMilestone, setSelectedMilestone] =
    useState<MilestoneWithUser | null>(null);
  const [isNearTreasuryPaymentModalOpen, setIsNearTreasuryPaymentModalOpen] =
    useState(false);

  const {
    isOpen: isManualPaymentModalOpen,
    onOpen: onManualPaymentModalOpen,
    onClose: onManualPaymentModalClose,
  } = useDisclosure();

  const {
    isOpen: isVerifyPaymentModalOpen,
    onOpen: onVerifyPaymentModalOpen,
    onClose: onVerifyPaymentModalClose,
  } = useDisclosure();

  const defaultVisibleColumns: Record<ColumnKey, boolean> = {
    index: true,
    dueDate: true,
    title: true,
    description: true,
    amount: true,
    status: true,
    paymentDate: false,
    approvedDate: false,
    activity: false,
  };

  const { visibleColumns, toggleColumn } = useColumnVisibility<ColumnKey>(
    'MilestoneTable',
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

  const handleSort = (column: string, direction: 'asc' | 'desc' | null) => {
    setCurrentSort({ column, direction });
  };

  const sortedMilestones = useMemo(() => {
    const milestones = [...(submission.Milestones || [])];
    if (!currentSort.direction) return milestones;

    return milestones.sort((a, b) => {
      let aVal, bVal;

      switch (currentSort.column) {
        case 'index':
          aVal = a.milestoneIndex;
          bVal = b.milestoneIndex;
          break;
        case 'dueDate':
          aVal = a.deadline ? new Date(a.deadline).getTime() : 0;
          bVal = b.deadline ? new Date(b.deadline).getTime() : 0;
          break;
        case 'amount':
          aVal = a.reward;
          bVal = b.reward;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'paymentDate':
          aVal = a.paidDate ? new Date(a.paidDate).getTime() : 0;
          bVal = b.paidDate ? new Date(b.paidDate).getTime() : 0;
          break;
        case 'approvedDate':
          aVal = a.approvedDate ? new Date(a.approvedDate).getTime() : 0;
          bVal = b.approvedDate ? new Date(b.approvedDate).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (currentSort.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [submission.Milestones, currentSort]);

  const handleOpenManualPaymentModal = (milestone: MilestoneWithUser) => {
    setSelectedMilestone(milestone);
    onManualPaymentModalOpen();
  };

  const handleOpenVerifyPaymentModal = (milestone: MilestoneWithUser) => {
    setSelectedMilestone(milestone);
    onVerifyPaymentModalOpen();
  };

  const handleOpenNearTreasuryModal = (milestone: MilestoneWithUser) => {
    setSelectedMilestone(milestone);
    setIsNearTreasuryPaymentModalOpen(true);
  };

  if (!sortedMilestones.length) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-500">
        No milestones found for this submission
      </div>
    );
  }

  const isUSDbased = submission.listing.token === 'Any';

  return (
    <>
      <div
        className={cn(
          'w-full overflow-x-auto rounded-md border border-slate-200',
          className,
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100 hover:bg-muted">
              {visibleColumns.index && (
                <SortableTH
                  column="index"
                  currentSort={currentSort}
                  setSort={handleSort}
                  className={cn(thClassName)}
                >
                  #
                </SortableTH>
              )}
              {visibleColumns.title && (
                <TableHead className={cn(thClassName)}>Title</TableHead>
              )}
              {visibleColumns.description && (
                <TableHead className={cn(thClassName)}>Description</TableHead>
              )}
              {visibleColumns.dueDate && (
                <SortableTH
                  column="dueDate"
                  currentSort={currentSort}
                  setSort={handleSort}
                  className={cn(thClassName)}
                >
                  Due Date
                </SortableTH>
              )}
              {visibleColumns.amount && (
                <SortableTH
                  column="amount"
                  currentSort={currentSort}
                  setSort={handleSort}
                  className={cn(thClassName)}
                >
                  Amount
                </SortableTH>
              )}
              {visibleColumns.status && (
                <SortableTH
                  column="status"
                  currentSort={currentSort}
                  setSort={handleSort}
                  className={cn(thClassName)}
                >
                  Status
                </SortableTH>
              )}
              {visibleColumns.approvedDate && (
                <SortableTH
                  column="approvedDate"
                  currentSort={currentSort}
                  setSort={handleSort}
                  className={cn(thClassName)}
                >
                  Approved Date
                </SortableTH>
              )}
              {visibleColumns.paymentDate && (
                <SortableTH
                  column="paymentDate"
                  currentSort={currentSort}
                  setSort={handleSort}
                  className={cn(thClassName)}
                >
                  Payment Date
                </SortableTH>
              )}
              {visibleColumns.activity && (
                <TableHead className={cn(thClassName)}>Activity</TableHead>
              )}
              <TableHead className={cn(thClassName, 'pl-6')}>Actions</TableHead>
              <TableHead className="sticky right-0 z-50 flex items-center justify-end bg-slate-100 group-hover:bg-muted">
                <ColumnVisibilitySettings
                  columns={columnDefinitions}
                  visibleColumns={visibleColumns}
                  toggleColumn={toggleColumn}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMilestones.map((milestone) => {
              const tokenObject = tokenList.find(
                (t) => t.tokenSymbol === milestone.token,
              );
              const statusStyle =
                colorMap[milestone.status as keyof typeof colorMap] ||
                colorMap.NotStarted;

              return (
                <TableRow key={milestone.id}>
                  {visibleColumns.index && (
                    <TableCell className="whitespace-nowrap text-sm font-medium text-slate-500">
                      {milestone.milestoneIndex}
                    </TableCell>
                  )}
                  {visibleColumns.title && (
                    <TableCell className="whitespace-nowrap text-sm font-medium text-slate-500">
                      {milestone.title}
                    </TableCell>
                  )}
                  {visibleColumns.description && (
                    <TableCell className="whitespace-nowrap text-sm font-medium text-slate-500">
                      {milestone.description}
                    </TableCell>
                  )}
                  {visibleColumns.dueDate && (
                    <TableCell className="whitespace-nowrap text-sm font-medium text-slate-500">
                      {milestone.deadline
                        ? dayjs(milestone.deadline).format("DD MMM'YY")
                        : '-'}
                    </TableCell>
                  )}
                  {visibleColumns.amount && (
                    <TableCell className="font-medium text-slate-700">
                      <div className="flex w-full items-center overflow-visible">
                        <img
                          src={tokenObject?.icon}
                          alt={tokenObject?.tokenSymbol}
                          className="h-4 w-4 rounded-full"
                        />
                        <span className="ml-1 truncate text-sm">
                          {isUSDbased ? '$' : ''}
                          {milestone.reward
                            ? milestone.reward.toLocaleString('en-us')
                            : '0'}

                          <span className="ml-1 font-semibold text-slate-400">
                            {isUSDbased ? ' to be paid in ' : ''}
                          </span>
                          <span
                            className={cn(
                              'ml-1',
                              !isUSDbased && 'font-semibold text-slate-400',
                            )}
                          >
                            {milestone.token}
                          </span>
                        </span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.status && (
                    <TableCell>
                      <p
                        className={cn(
                          'inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium',
                          statusStyle?.color,
                          statusStyle?.bg,
                        )}
                      >
                        {milestone.status.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                    </TableCell>
                  )}
                  {visibleColumns.approvedDate && (
                    <TableCell>
                      <Tooltip
                        disabled={!milestone.approvedByUser}
                        content={
                          <DoneBy
                            doneBy={
                              milestone.approvedByUser as User | undefined
                            }
                            doneByType="approved"
                          />
                        }
                      >
                        <p className="whitespace-nowrap text-sm font-medium text-slate-500">
                          {milestone.approvedDate
                            ? dayjs(milestone.approvedDate).format("DD MMM'YY")
                            : '-'}
                        </p>
                      </Tooltip>
                    </TableCell>
                  )}
                  {visibleColumns.paymentDate && (
                    <TableCell>
                      <Tooltip
                        disabled={!milestone.paidByUser}
                        content={
                          <DoneBy
                            doneBy={milestone.paidByUser as User | undefined}
                            doneByType="paid"
                          />
                        }
                      >
                        <p className="whitespace-nowrap text-sm font-medium text-slate-500">
                          {milestone.paidDate
                            ? dayjs(milestone.paidDate).format("DD MMM'YY")
                            : '-'}
                        </p>
                      </Tooltip>
                    </TableCell>
                  )}

                  {visibleColumns.activity && (
                    <TableCell className="items-center py-2">
                      <ActivityHistoryMinified
                        id={milestone.id}
                        refType="milestone"
                      />
                    </TableCell>
                  )}
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                      <MilestoneActionButton
                        milestone={milestone}
                        listing={submission.listing}
                        handleOpenVerifyPaymentModal={() =>
                          handleOpenVerifyPaymentModal(milestone)
                        }
                        handleOpenNearTreasuryModal={() =>
                          handleOpenNearTreasuryModal(milestone)
                        }
                        handleOpenManualPaymentModal={() =>
                          handleOpenManualPaymentModal(milestone)
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedMilestone && (
        <>
          <NearTreasuryPaymentModal
            isOpen={isNearTreasuryPaymentModalOpen}
            onClose={() => {
              setIsNearTreasuryPaymentModalOpen(false);
              setSelectedMilestone(null);
            }}
            milestoneId={selectedMilestone.id}
            onSuccess={() => {
              queryClient.invalidateQueries({
                queryKey: ['sponsor-submissions'],
              });
              queryClient.invalidateQueries({
                queryKey: ['logs-infinite'],
              });
              queryClient.invalidateQueries({
                queryKey: ['sponsor-dashboard-listing'],
              });
            }}
          />

          <AddManualPaymentModal
            isOpen={isManualPaymentModalOpen}
            onClose={() => {
              onManualPaymentModalClose();
              setSelectedMilestone(null);
            }}
            milestone={selectedMilestone}
            listingToken={listing.token}
            onSuccess={() => {
              queryClient.invalidateQueries({
                queryKey: ['sponsor-submissions'],
              });
              queryClient.invalidateQueries({
                queryKey: ['logs-infinite'],
              });
              queryClient.invalidateQueries({
                queryKey: ['sponsor-dashboard-listing'],
              });
            }}
          />

          <VerifyPaymentModal
            listing={listing}
            setSelectedSubmission={() => {
              queryClient.invalidateQueries({
                queryKey: ['sponsor-submissions'],
              });
              queryClient.invalidateQueries({
                queryKey: ['logs-infinite'],
              });
            }}
            setListing={() => {
              queryClient.invalidateQueries({
                queryKey: ['sponsor-dashboard-listing'],
              });
            }}
            isOpen={isVerifyPaymentModalOpen}
            onClose={() => {
              onVerifyPaymentModalClose();
              setSelectedMilestone(null);
            }}
            listingId={listing.id}
            listingType={listing.type}
            selectedSubmission={submission}
          />
        </>
      )}
    </>
  );
}
