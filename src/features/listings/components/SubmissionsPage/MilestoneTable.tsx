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
import { tokenList } from '@/constants/tokenList';
import { cn } from '@/utils/cn';
import { dayjs } from '@/utils/dayjs';
import { getMilestoneStatus } from '@/utils/milestone-helpers';

import { type Listing } from '@/features/listings/types';
import { DisplayPayment } from '@/features/sponsor-dashboard/components/Submissions/DisplayPayment';
import { type SubmissionWithListingUser } from '@/features/sponsor-dashboard/queries/dashboard-submissions';
import { colorMap } from '@/features/sponsor-dashboard/utils/statusColorMap';

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
  | 'status';

const columnLabels: Record<ColumnKey, string> = {
  index: '#',
  dueDate: 'Due Date',
  title: 'Title',
  description: 'Description',
  amount: 'Amount',
  status: 'Status',
};

export default function MilestoneTable({
  listing,
  submission,
  className,
}: Props) {
  const [currentSort, setCurrentSort] = useState<{
    column: string;
    direction: 'asc' | 'desc' | null;
  }>({ column: '', direction: null });

  const defaultVisibleColumns: Record<ColumnKey, boolean> = {
    index: true,
    dueDate: true,
    title: true,
    description: true,
    amount: true,
    status: true,
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
          aVal = getMilestoneStatus(a);
          bVal = getMilestoneStatus(b);
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

  if (!sortedMilestones.length) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-500">
        No milestones found for this submission
      </div>
    );
  }

  const isUSDbased = submission.listing.token === 'Any';

  return (
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
            const milestoneStatus = getMilestoneStatus(milestone);
            const statusStyle =
              colorMap[milestoneStatus as keyof typeof colorMap] ||
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
                      {milestoneStatus.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </TableCell>
                )}

                <TableCell className="pl-6">
                  <div className="flex items-center gap-2">
                    {milestoneStatus === 'Paid' && (
                      <DisplayPayment
                        milestone={milestone}
                        listing={listing}
                        isSponsorView={false}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
