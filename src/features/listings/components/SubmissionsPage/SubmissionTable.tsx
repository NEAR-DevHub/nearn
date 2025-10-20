import axios from 'axios';
import { atom } from 'jotai';
import { Copy, Eye, Heart, MessageCircle, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import router from 'next/router';
import React, {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';

import {
  ColumnVisibilitySettings,
  useColumnVisibility,
} from '@/components/shared/column-visibility-settings';
import { SortableTH } from '@/components/shared/sortable-th';
import { Button } from '@/components/ui/button';
import { ExternalImage } from '@/components/ui/cloudinary-image';
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
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip } from '@/components/ui/tooltip';
import { tokenList } from '@/constants/tokenList';
import { useDynamicClipboard } from '@/hooks/use-clipboard';
import type { SubmissionWithUser } from '@/interface/submission';
import { useUser } from '@/store/user';
import { getSubmissionUrl } from '@/utils/bounty-urls';
import { cn } from '@/utils/cn';
import { dayjs } from '@/utils/dayjs';

import {
  parseHtml,
  tableOptions,
} from '@/features/sponsor-dashboard/components/InfoBox';
import { ListingTh } from '@/features/sponsor-dashboard/components/ListingTable';
import { colorMap } from '@/features/sponsor-dashboard/utils/statusColorMap';
import { EarnAvatar } from '@/features/talent/components/EarnAvatar';

import { type Listing } from '../../types';

export const selectedSubmissionAtom = atom<SubmissionWithUser | undefined>(
  undefined,
);

export const sponsorshipSubmissionStatus = (submission: SubmissionWithUser) => {
  if (submission.isArchived || submission.listing?.isArchived) return 'Deleted';
  if (
    submission.status === 'Approved' &&
    submission.Milestones &&
    submission.Milestones.length > 0 &&
    submission.Milestones.every((milestone) => milestone.status === 'Paid')
  )
    return 'Paid';
  if (submission.status !== 'Pending') return submission.status;
  return submission.label;
};

const thClassName =
  'text-sm font-medium capitalize tracking-tight text-slate-400';

interface Props {
  bounty: Listing;
  submissions: SubmissionWithUser[];
  endTime: string;
  setUpdate: Dispatch<SetStateAction<boolean>>;
}

export const LikeAndComment = ({
  id,
  bounty,
  submission,
  setUpdate,
  ref,
}: {
  id: string;
  bounty: Listing;
  submission: SubmissionWithUser;
  setUpdate: Dispatch<SetStateAction<boolean>>;
  ref?: React.RefObject<HTMLDivElement | null>;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useUser();
  const [commentCount, setCommentCount] = useState<number>(0);

  useEffect(() => {
    axios
      .get(`/api/comment/${id}`)
      .then((res) => setCommentCount(res.data.count))
      .catch((err) => console.log(err));
  }, [id]);

  const scrollToRef = () => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsLoading(true);

    const likePromise = axios
      .post('/api/submission/like/', { id })
      .then()
      .finally(() => {
        setIsLoading(false);
        setUpdate((prev: boolean) => !prev);
      });

    toast.promise(likePromise, {
      loading: 'Liking the submission...',
      success: () => {
        const likeAdded = submission.like?.some(
          (e: { id: string; date: number }) => e.id === user?.id,
        )
          ? 'Like removed'
          : 'Liked submission';
        return `${likeAdded}`;
      },
      error: 'Error while liking submission',
    });
  };

  return (
    <div className="flex w-full items-center gap-4">
      <Button
        className={cn(
          'z-10 flex h-auto items-center gap-2 p-0 text-sm font-medium',
          'text-slate-500 hover:bg-transparent',
        )}
        variant="ghost"
        disabled={isLoading}
        onClick={(e) => {
          e.stopPropagation();
          handleLike(e);
        }}
        type="button"
      >
        <Heart
          className={cn(
            'h-4 w-4 stroke-2',
            !submission.like?.find(
              (e: { id: string; date: number }) => e.id === user?.id,
            )
              ? 'fill-white text-slate-500'
              : 'fill-rose-600 text-rose-600',
          )}
        />
        {submission.like?.length || 0}
      </Button>
      {!ref ? (
        <Link
          className={cn(
            'z-10 flex h-auto items-center gap-2 p-0 text-sm font-medium',
            'text-slate-500 hover:bg-transparent',
          )}
          href={`${getSubmissionUrl(submission, bounty)}#comments`}
        >
          <MessageCircle className="h-4 w-4 cursor-pointer fill-white stroke-2" />
          {commentCount}
        </Link>
      ) : (
        <button
          className={cn(
            'z-10 flex h-auto items-center gap-2 p-0 text-sm font-medium',
            'text-slate-500 hover:bg-transparent',
          )}
          onClick={scrollToRef}
        >
          <MessageCircle className="h-4 w-4 cursor-pointer fill-white stroke-2" />
          {commentCount}
        </button>
      )}
    </div>
  );
};

export const SubmissionTable = ({
  bounty,
  submissions,
  endTime,
  setUpdate,
}: Props) => {
  const [currentSort, setCurrentSort] = useState<{
    column: string;
    direction: 'asc' | 'desc' | null;
  }>({ column: '', direction: null });
  const { onCopy: onCopySubmissionLink } = useDynamicClipboard();

  const eligibilityQuestions = bounty.eligibility ?? [];
  const eligibilityColumnKeys = eligibilityQuestions.map(
    (_, idx) => `eligibility-${idx}` as const,
  );

  const filteredSubmissions = useMemo(() => {
    if (currentSort.direction && currentSort.column) {
      return [...submissions].sort((a, b) => {
        const factor = currentSort.direction === 'asc' ? 1 : -1;

        switch (currentSort.column) {
          case 'id':
            return (b.sequentialId - a.sequentialId) * factor;
          case 'user':
            const nameA =
              (a.user?.private ? a.user.username : a.user?.name) || '';
            const nameB =
              (b.user?.private ? b.user.username : b.user?.name) || '';
            const name = nameA.localeCompare(nameB) * factor;

            if (name !== 0) {
              return name;
            }

            const createdAtA = a.createdAt || '';
            const createdAtB = b.createdAt || '';
            return createdAtA.localeCompare(createdAtB) * factor;

          case 'ask':
            let rewardA = a.ask ?? 0;
            let rewardB = b.ask ?? 0;
            if (
              bounty.compensationType === 'fixed' &&
              a.winnerPosition &&
              a.isWinner
            ) {
              rewardA = bounty.rewards?.[a.winnerPosition] ?? 0;
            }
            if (
              bounty.compensationType === 'fixed' &&
              b.winnerPosition &&
              b.isWinner
            ) {
              rewardB = bounty.rewards?.[b.winnerPosition] ?? 0;
            }
            return (rewardB - rewardA) * factor;

          case 'status':
            const statusA = sponsorshipSubmissionStatus(a);
            const statusB = sponsorshipSubmissionStatus(b);
            return statusA.localeCompare(statusB) * factor;

          default:
            return 0;
        }
      });
    }

    return submissions;
  }, [submissions, currentSort]);

  const isUsdBased = bounty.token === 'Any';

  type ColumnKey =
    | (typeof eligibilityColumnKeys)[number]
    | 'submission'
    | 'ask'
    | 'status'
    | 'community';

  const defaultVisibleColumns = useMemo<Record<ColumnKey, boolean>>(() => {
    const base: Record<ColumnKey, boolean> = {
      submission: true,
      ask: true,
      status: true,
      community: true,
    } as Record<ColumnKey, boolean>;

    eligibilityColumnKeys.forEach((k) => {
      base[k] = false as boolean;
    });
    return base;
  }, [eligibilityColumnKeys]);

  const { visibleColumns, toggleColumn } = useColumnVisibility<ColumnKey>(
    `SubmissionTable:${bounty.id}`,
    defaultVisibleColumns,
  );

  const answers = useMemo(() => {
    const answers = new Map<string, React.ReactNode>();
    filteredSubmissions.forEach((submission) => {
      submission.eligibilityAnswers?.forEach(
        (answer: { question: string; answer: string }) => {
          const ans = answer.answer ?? '\u2014';
          if (typeof ans === 'string') {
            answers.set(
              `${submission.id}-${answer.question}`,
              parseHtml(ans, tableOptions),
            );
          } else {
            answers.set(
              `${submission.id}-${answer.question}`,
              JSON.stringify(ans),
            );
          }
        },
      );
    });
    return answers;
  }, [filteredSubmissions]);

  const getColumnLabel = (key: ColumnKey) => {
    if (key === 'submission') return 'Submission';
    if (key === 'ask')
      return bounty.compensationType === 'fixed' ? 'Reward' : 'Ask';
    if (key === 'status') return 'Status';
    if (key === 'community') return 'Community';
    if (key.startsWith('eligibility-')) {
      const index = Number(key.split('-')[1]);
      const q = eligibilityQuestions[index];
      if (!q?.question) return `Question ${index + 1}`;
      return (
        <span className="inline-flex max-w-[12rem] items-center">
          <p className="line-clamp-1 text-left">
            {parseHtml(q.question, tableOptions)}
          </p>
        </span>
      );
    }
    return key;
  };

  const columnDefinitions = useMemo<
    { key: ColumnKey; label: React.ReactNode }[]
  >(
    () => [
      { key: 'submission' as ColumnKey, label: getColumnLabel('submission') },
      { key: 'ask' as ColumnKey, label: getColumnLabel('ask') },
      { key: 'status' as ColumnKey, label: getColumnLabel('status') },
      ...eligibilityColumnKeys.map((k) => ({
        key: k,
        label: getColumnLabel(k),
      })),
      { key: 'community' as ColumnKey, label: getColumnLabel('community') },
    ],
    [eligibilityQuestions],
  );

  const onSort = (column: string, direction: 'asc' | 'desc' | null) => {
    setCurrentSort({ column, direction });
  };

  const handleCopySubmissionLink = (submissionLink: string) => {
    onCopySubmissionLink(submissionLink);
    toast.success('Submission link copied', {
      duration: 1500,
    });
  };

  function handleClick(e: React.MouseEvent, href: string) {
    if (e.button === 1 || e.ctrlKey || e.metaKey) {
      window.open(href, '_blank');
      return;
    }

    router.push(href);
  }

  return (
    <>
      <div className="mt-10 flex min-h-screen w-full flex-col items-center md:items-start">
        {dayjs(endTime).valueOf() < Date.now() || submissions.length > 0 ? (
          <div className="w-full max-w-4xl overflow-x-auto rounded-md border border-slate-200">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="group bg-slate-100 hover:bg-muted">
                  <SortableTH
                    column="id"
                    currentSort={currentSort}
                    setSort={onSort}
                    className={cn(thClassName)}
                  >
                    #
                  </SortableTH>
                  {visibleColumns.submission && (
                    <SortableTH
                      column="user"
                      currentSort={currentSort}
                      setSort={onSort}
                      className={cn(thClassName)}
                    >
                      {getColumnLabel('submission')}
                    </SortableTH>
                  )}
                  {visibleColumns.ask && (
                    <SortableTH
                      column="ask"
                      currentSort={currentSort}
                      setSort={onSort}
                      className={cn(thClassName)}
                    >
                      {getColumnLabel('ask')}
                    </SortableTH>
                  )}
                  {visibleColumns.status && (
                    <SortableTH
                      column="status"
                      currentSort={currentSort}
                      setSort={onSort}
                      className={cn(thClassName)}
                    >
                      {getColumnLabel('status')}
                    </SortableTH>
                  )}
                  {eligibilityColumnKeys.map((colKey) =>
                    visibleColumns[colKey] ? (
                      <ListingTh key={colKey}>
                        {getColumnLabel(colKey)}
                      </ListingTh>
                    ) : null,
                  )}
                  {visibleColumns.community && <ListingTh>Community</ListingTh>}
                  <ListingTh>Actions</ListingTh>
                  <ListingTh className="sticky right-0 z-50 flex items-center bg-slate-100 group-hover:bg-muted">
                    <ColumnVisibilitySettings
                      columns={columnDefinitions}
                      visibleColumns={visibleColumns}
                      toggleColumn={toggleColumn}
                    />
                  </ListingTh>
                </TableRow>
              </TableHeader>
              {
                <TableBody className="w-full">
                  {filteredSubmissions.map((submission) => {
                    const submissionStatus =
                      sponsorshipSubmissionStatus(submission);
                    const submissionLink = getSubmissionUrl(submission, bounty);
                    const token = isUsdBased ? submission.token : bounty.token;
                    const tokenObject = tokenList.filter(
                      (e) => e?.tokenSymbol === token,
                    )[0];
                    let ask = submission.ask;
                    if (
                      bounty.compensationType === 'fixed' &&
                      submission.winnerPosition &&
                      submission.isWinner
                    ) {
                      ask = bounty.rewards?.[submission.winnerPosition] ?? 0;
                    }

                    return (
                      <TableRow key={submission.id}>
                        <TableCell
                          className="cursor-pointer"
                          onClick={(e) => handleClick(e, submissionLink)}
                          onAuxClick={(e) => handleClick(e, submissionLink)}
                        >
                          <p className="whitespace-nowrap text-sm font-medium text-slate-500">
                            {submission.sequentialId}
                          </p>
                        </TableCell>
                        {visibleColumns.submission && (
                          <TableCell className="min-w-[225px] pr-0">
                            <Link
                              className="flex items-center"
                              href={`/t/${submission?.user?.username}`}
                            >
                              <EarnAvatar
                                id={submission?.user?.id}
                                avatar={submission?.user?.photo || undefined}
                              />
                              <div className="ml-2 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate whitespace-nowrap text-sm font-medium text-slate-700">
                                    {submission?.user?.private
                                      ? submission?.user?.username
                                      : submission?.user?.name}
                                  </p>
                                  {submission?.user?.publicKey && (
                                    <KycComponent
                                      address={submission.user.publicKey}
                                      imageOnly
                                      variant="xs"
                                      listingSponsorId={bounty?.sponsorId}
                                    />
                                  )}
                                </div>
                                <p className="truncate text-xs font-medium text-slate-500">
                                  {dayjs(submission.createdAt).format(
                                    "D MMM' YY h:mm A",
                                  )}
                                </p>
                              </div>
                            </Link>
                          </TableCell>
                        )}
                        {visibleColumns.ask && (
                          <TableCell
                            className="min-w-[225px] cursor-pointer font-medium text-slate-700"
                            onClick={(e) => handleClick(e, submissionLink)}
                            onAuxClick={(e) => handleClick(e, submissionLink)}
                          >
                            <div className="flex w-full items-center overflow-visible">
                              <img
                                src={tokenObject?.icon}
                                alt={tokenObject?.tokenSymbol}
                                className="h-4 w-4 rounded-full"
                              />
                              <span className="ml-1 truncate text-sm">
                                {isUsdBased && '$'}
                                {ask ? ask.toLocaleString('en-US') : '0'}
                                <span className="text-slate-400">
                                  {isUsdBased && ' to be paid in'}
                                </span>
                                <span
                                  className={cn(
                                    'ml-1',
                                    !isUsdBased &&
                                      'font-semibold text-slate-400',
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
                            className="cursor-pointer py-2"
                            onClick={(e) => handleClick(e, submissionLink)}
                            onAuxClick={(e) => handleClick(e, submissionLink)}
                          >
                            <span
                              className={cn(
                                'inline-flex whitespace-nowrap rounded-full px-3 py-1 text-center text-[10px] capitalize',
                                colorMap[
                                  submissionStatus as keyof typeof colorMap
                                ].bg,
                                colorMap[
                                  submissionStatus as keyof typeof colorMap
                                ].color,
                              )}
                            >
                              {submissionStatus}
                            </span>
                          </TableCell>
                        )}
                        {eligibilityColumnKeys.map((colKey, colIndex) => {
                          if (!visibleColumns[colKey]) return null;

                          const answer = answers.get(
                            `${submission.id}-${eligibilityQuestions[colIndex]?.question ?? ''}`,
                          );

                          return (
                            <TableCell
                              key={`${submission.id}-${colKey}`}
                              className="cursor-pointer py-2"
                              onClick={(e) => handleClick(e, submissionLink)}
                              onAuxClick={(e) => handleClick(e, submissionLink)}
                            >
                              <Tooltip
                                content={answer}
                                triggerClassName="flex max-w-[12rem]"
                              >
                                <div className="line-clamp-2 text-left text-sm text-slate-700">
                                  {answer}
                                </div>
                              </Tooltip>
                            </TableCell>
                          );
                        })}
                        {visibleColumns.community && (
                          <TableCell className="items-center py-2">
                            <LikeAndComment
                              id={submission.id}
                              bounty={bounty}
                              submission={submission}
                              setUpdate={setUpdate}
                            />
                          </TableCell>
                        )}
                        <TableCell className="px-0 py-2">
                          <div className="flex items-center justify-between">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ph-no-capture text-[13px] font-medium text-black"
                            >
                              <Link
                                href={submissionLink}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View Submission
                              </Link>
                            </Button>
                          </div>
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
                            <DropdownMenuContent
                              align="end"
                              className="max-w-60"
                            >
                              <DropdownMenuItem
                                className="cursor-pointer text-sm font-medium text-slate-500"
                                onClick={() => {
                                  handleCopySubmissionLink(submissionLink);
                                }}
                              >
                                <Copy className="mr-1 h-4 w-4" />
                                Copy Link
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              }
            </Table>
          </div>
        ) : (
          <div className="flex h-[25rem] w-full flex-col items-center justify-center gap-5">
            <ExternalImage alt={'submission'} src={'/icons/submission.svg'} />
            <p className="text-center text-2xl font-semibold text-gray-800">
              Submissions are not public until the submission deadline
              <br />
              has closed. Check back soon!
            </p>
          </div>
        )}
      </div>
    </>
  );
};
