import {
  CircleHelp,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  EyeOff,
  MoreVertical,
  Pencil,
  PencilLine,
  RefreshCw,
  Trash,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { usePostHog } from 'posthog-js/react';
import React, { useState } from 'react';
import { IoDuplicateOutline } from 'react-icons/io5';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip } from '@/components/ui/tooltip';
import { useDisclosure } from '@/hooks/use-disclosure';
import { type SponsorType } from '@/interface/sponsor';
import { getBountyUrl } from '@/utils/bounty-urls';
import { cn } from '@/utils/cn';
import { getURL } from '@/utils/validUrl';

import { type ListingWithSubmissions } from '@/features/listings/types';
import { formatDeadline } from '@/features/listings/utils/deadline';
import { getColorStyles } from '@/features/listings/utils/getColorStyles';
import { getListingIcon } from '@/features/listings/utils/getListingIcon';
import {
  getListingStatus,
  getListingTypeLabel,
} from '@/features/listings/utils/status';

import { ListingStatusModal } from './ListingStatusModal';
import { DeleteDraftModal } from './Modals/DeleteDraftModal';
import { UnpublishModal } from './Modals/UnpublishModal';
import { VerifyPaymentModal } from './Modals/VerifyPayment';
import { SponsorPrize } from './SponsorPrize';
import { DeleteRestoreListingModal } from './Submissions/Modals/DeleteRestoreListingModal';

interface ListingTableProps {
  sponsor: SponsorType | undefined;
  listings: ListingWithSubmissions[];
  refreshListings: () => void;
  currentSort: {
    column: string;
    direction: 'asc' | 'desc' | null;
  };
  onSort: (column: string, direction: 'asc' | 'desc' | null) => void;
}

const thClassName =
  'text-sm font-medium capitalize tracking-tight text-slate-400';

type ColumnKey = 'title' | 'submissions' | 'deadline' | 'prize' | 'status';

// helper to get readable label
const columnLabels: Record<ColumnKey, string> = {
  title: 'Listing Name',
  submissions: 'Submissions',
  deadline: 'Deadline',
  prize: 'Prize',
  status: 'Status',
};

export const ListingTh = ({
  children,
  className,
}: {
  children?: string | React.ReactNode;
  className?: string;
}) => {
  return (
    <TableHead className={cn(thClassName, className)}>{children}</TableHead>
  );
};

export const ListingTable = ({
  sponsor,
  listings,
  currentSort,
  onSort,
  refreshListings,
}: ListingTableProps) => {
  const [selectedListing, setSelectedListing] =
    useState<ListingWithSubmissions>({
      BountyCounts: {
        totalWinnersSelected: 0,
        totalPaymentsMade: 0,
      },
    });

  const router = useRouter();
  const posthog = usePostHog();
  const { data: session } = useSession();

  const {
    isOpen: statusModalOpen,
    onOpen: statusModalOnOpen,
    onClose: statusModalOnClose,
  } = useDisclosure();
  const {
    isOpen: unpublishIsOpen,
    onOpen: unpublishOnOpen,
    onClose: unpublishOnClose,
  } = useDisclosure();
  const {
    isOpen: deleteDraftIsOpen,
    onOpen: deleteDraftOnOpen,
    onClose: deleteDraftOnClose,
  } = useDisclosure();
  const {
    isOpen: verifyPaymentIsOpen,
    onOpen: verifyPaymentOnOpen,
    onClose: verifyPaymentOnClose,
  } = useDisclosure();
  const {
    isOpen: deleteModalOpen,
    onOpen: deleteModalOnOpen,
    onClose: deleteModalOnClose,
  } = useDisclosure();

  const defaultVisibleColumns: Record<ColumnKey, boolean> = {
    title: true,
    submissions: true,
    deadline: true,
    prize: true,
    status: true,
  };

  const { visibleColumns, toggleColumn } = useColumnVisibility<ColumnKey>(
    `MyListings-Sponsor-Dashboard`,
    defaultVisibleColumns,
  );

  const columnDefinitions = (
    Object.keys(defaultVisibleColumns) as ColumnKey[]
  ).map((k) => ({ key: k, label: columnLabels[k] }));

  const handleUnpublish = async (
    unpublishedListing: ListingWithSubmissions,
  ) => {
    setSelectedListing(unpublishedListing);
    unpublishOnOpen();
  };

  const handleDeleteDraft = async (deleteListing: ListingWithSubmissions) => {
    setSelectedListing(deleteListing);
    deleteDraftOnOpen();
  };

  const handleVerifyPayment = async (listing: ListingWithSubmissions) => {
    setSelectedListing(listing);
    verifyPaymentOnOpen();
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

  function handleRowClick(e: React.MouseEvent, href: string) {
    if (e.button === 1 || e.ctrlKey || e.metaKey) {
      window.open(href, '_blank');
      return;
    }

    router.push(href);
  }

  if (!listings.length) return;

  return (
    <>
      <ListingStatusModal
        isOpen={statusModalOpen}
        onClose={statusModalOnClose}
      />
      <UnpublishModal
        listingId={selectedListing.id}
        unpublishIsOpen={unpublishIsOpen}
        unpublishOnClose={() => {
          unpublishOnClose();
          refreshListings();
        }}
        listingType={selectedListing.type}
      />
      <DeleteDraftModal
        deleteDraftIsOpen={deleteDraftIsOpen}
        deleteDraftOnClose={() => {
          deleteDraftOnClose();
          refreshListings();
        }}
        listingId={selectedListing.id}
        listingType={selectedListing.type}
      />
      <VerifyPaymentModal
        listing={selectedListing}
        setListing={setSelectedListing}
        isOpen={verifyPaymentIsOpen}
        onClose={() => {
          verifyPaymentOnClose();
          refreshListings();
        }}
        listingId={selectedListing.id}
        listingType={selectedListing.type}
        selectedSubmission={undefined}
        setSelectedSubmission={() => {}}
      />
      <DeleteRestoreListingModal
        isOpen={deleteModalOpen}
        onClose={deleteModalOnClose}
        listing={selectedListing}
        onSuccess={refreshListings}
      />
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
              <ListingTh />
              {visibleColumns.title && (
                <SortableTH
                  column="title"
                  currentSort={currentSort}
                  setSort={onSort}
                  className={cn(thClassName)}
                >
                  Listing Name
                </SortableTH>
              )}
              {visibleColumns.submissions && (
                <SortableTH
                  column="submissions"
                  currentSort={currentSort}
                  setSort={onSort}
                  className={cn(thClassName, 'text-center')}
                >
                  Submissions
                </SortableTH>
              )}
              {visibleColumns.deadline && (
                <SortableTH
                  column="deadline"
                  currentSort={currentSort}
                  setSort={onSort}
                  className={cn(thClassName)}
                >
                  Deadline
                </SortableTH>
              )}
              {visibleColumns.prize && <ListingTh>Prize</ListingTh>}
              {visibleColumns.status && (
                <SortableTH
                  column="status"
                  currentSort={currentSort}
                  setSort={onSort}
                  className={cn(thClassName)}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-3 w-3 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        statusModalOnOpen();
                      }}
                    >
                      <CircleHelp
                        className="text-slate-400 hover:text-slate-600"
                        style={{ width: '12px', height: '12px' }}
                      />
                    </Button>
                  </div>
                </SortableTH>
              )}
              <ListingTh className="pl-6">Actions</ListingTh>
              <ListingTh className="sticky right-0 z-50 flex items-center bg-slate-100 group-hover:bg-muted">
                <ColumnVisibilitySettings
                  columns={columnDefinitions}
                  visibleColumns={visibleColumns}
                  toggleColumn={toggleColumn}
                />
              </ListingTh>
            </TableRow>
          </TableHeader>
          <TableBody className="w-full">
            {listings.map((listing) => {
              const listingType = getListingTypeLabel(
                listing?.type ?? 'bounty',
              );

              const deadline = formatDeadline(listing?.deadline, listing?.type);

              const listingStatus = getListingStatus(listing);
              const listingLabel =
                listingStatus === 'Draft'
                  ? 'Draft'
                  : getListingTypeLabel(listing?.type!);

              const listingLink =
                listing?.type === 'grant'
                  ? `${getURL()}grants/${listing.slug}`
                  : getBountyUrl({ ...listing, sponsor: sponsor });

              const listingSubmissionLink =
                listing.type === 'grant'
                  ? `/dashboard/grants/${listing.slug}/applications/`
                  : `/dashboard/listings/${listing.slug}/submissions/`;

              const editLink = `/dashboard/listings/${listing.slug}/edit/`;

              const textColor = getColorStyles(listingStatus).color;
              const bgColor = getColorStyles(listingStatus).bgColor;

              return (
                <TableRow
                  key={listing?.id}
                  className="cursor-pointer"
                  onClick={(e) =>
                    handleRowClick(
                      e,
                      listing.isPublished ? listingSubmissionLink : editLink,
                    )
                  }
                  onAuxClick={(e) =>
                    handleRowClick(
                      e,
                      listing.isPublished ? listingSubmissionLink : editLink,
                    )
                  }
                >
                  <TableCell className="pr-0">
                    <p className="whitespace-nowrap text-sm font-medium text-slate-500">
                      {listing.sequentialId !== 0 ? listing.sequentialId : '—'}
                    </p>
                  </TableCell>
                  <TableCell className="pr-0">
                    <Tooltip content={<p>{listingType}</p>}>
                      <img
                        className="mt-1.5 h-5 min-h-5 w-5 min-w-5 flex-shrink-0 rounded-full"
                        alt={`New ${listingType}`}
                        src={getListingIcon(listing.type!)}
                        title={listingType}
                      />
                    </Tooltip>
                  </TableCell>
                  {visibleColumns.title && (
                    <TableCell className="max-w-80 whitespace-normal break-words font-medium text-slate-700">
                      <Link
                        className={cn('ph-no-capture')}
                        href={
                          listing.isPublished ? listingSubmissionLink : editLink
                        }
                        onClick={() => {
                          posthog.capture('submissions_sponsor');
                        }}
                      >
                        <p
                          className="cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-medium text-slate-500 hover:underline"
                          title={listing.title}
                        >
                          {listing.title}
                        </p>
                      </Link>
                    </TableCell>
                  )}
                  {visibleColumns.submissions && (
                    <TableCell className="py-2">
                      <p className="text-center text-sm font-medium text-slate-500">
                        {listing.submissionCount}
                      </p>
                    </TableCell>
                  )}
                  {visibleColumns.deadline && (
                    <TableCell className="items-center py-2">
                      <p className="whitespace-nowrap text-sm font-medium text-slate-500">
                        {deadline}
                      </p>
                    </TableCell>
                  )}
                  {visibleColumns.prize && (
                    <TableCell className="mt-0 min-w-[150px]">
                      <SponsorPrize bounty={listing} smallView={true} />
                    </TableCell>
                  )}
                  {visibleColumns.status && (
                    <TableCell className="items-center py-2">
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
                  <TableCell className="px-3 py-2">
                    {listing.status === 'OPEN' && !!listing.isPublished ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ph-no-capture text-[13px] font-medium text-black"
                        onClick={() => {
                          posthog.capture('submissions_sponsor');
                          router.push(listingSubmissionLink);
                        }}
                      >
                        <Link
                          href={listingSubmissionLink}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View{' '}
                          {listing?.type === 'grant'
                            ? ' Applications'
                            : ' Submissions'}
                        </Link>
                      </Button>
                    ) : (session?.user?.role === 'GOD' &&
                        listing.type !== 'grant' &&
                        !listing.isPublished) ||
                      (listing.type !== 'grant' &&
                        listing.status === 'OPEN') ? (
                      <Link href={editLink}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[13px] font-medium text-slate-500 hover:bg-slate-200"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                    ) : (
                      <p className="px-3 text-slate-400">—</p>
                    )}
                  </TableCell>
                  <TableCell className="px-0 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="hover:bg-slate-100"
                          size="icon"
                          variant="ghost"
                          onClick={(e) => e.stopPropagation()}
                          onAuxClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="max-w-60">
                        <DropdownMenuItem
                          className="cursor-pointer text-sm font-medium text-slate-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(listingLink, '_blank');
                          }}
                          onAuxClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View {listingLabel}
                        </DropdownMenuItem>

                        {!!listing.isPublished && (
                          <DropdownMenuItem
                            className="cursor-pointer text-sm font-medium text-slate-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(listingLink);
                            }}
                            onAuxClick={(e) => e.stopPropagation()}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                          </DropdownMenuItem>
                        )}

                        {!!(
                          (session?.user?.role === 'GOD' &&
                            listing.type !== 'grant') ||
                          (listing.type !== 'grant' &&
                            listing.status === 'OPEN')
                        ) && (
                          <Link
                            className="block"
                            href={editLink}
                            onClick={(e) => e.stopPropagation()}
                            onAuxClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem className="cursor-pointer text-sm font-medium text-slate-500">
                              <PencilLine className="mr-2 h-4 w-4" />
                              Edit {listingLabel}
                            </DropdownMenuItem>
                          </Link>
                        )}

                        {(listing.type === 'bounty' ||
                          listing.type === 'project' ||
                          listing.type === 'sponsorship') && (
                          <DropdownMenuItem
                            className="ph-no-capture cursor-pointer text-sm font-medium text-slate-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              posthog.capture('duplicate listing_sponsor');
                              window.open(
                                `${router.basePath}/dashboard/listings/${listing.slug}/duplicate`,
                                '_blank',
                              );
                            }}
                            onAuxClick={(e) => e.stopPropagation()}
                          >
                            <IoDuplicateOutline className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                        )}

                        {listingStatus === 'Draft' &&
                          listing?.type !== 'grant' && (
                            <DropdownMenuItem
                              className="cursor-pointer text-sm font-medium text-slate-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDraft(listing);
                              }}
                              onAuxClick={(e) => e.stopPropagation()}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Draft
                            </DropdownMenuItem>
                          )}

                        {session?.user?.role === 'GOD' &&
                          listingStatus !== 'Draft' &&
                          listing?.type !== 'grant' && (
                            <DropdownMenuItem
                              className={cn(
                                'cursor-pointer text-sm font-medium text-slate-500',
                                listing.isArchived && 'hover:text-brand-green',
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedListing(listing);
                                deleteModalOnOpen();
                              }}
                              onAuxClick={(e) => e.stopPropagation()}
                            >
                              {listing.isArchived || !listing.isActive ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Restore
                                </>
                              ) : (
                                <>
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </>
                              )}
                            </DropdownMenuItem>
                          )}

                        {(listingStatus === 'Payment Pending' ||
                          listing.type === 'sponsorship') &&
                          listing?.type !== 'grant' && (
                            <DropdownMenuItem
                              className="cursor-pointer whitespace-nowrap text-sm font-medium text-slate-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerifyPayment(listing);
                              }}
                              onAuxClick={(e) => e.stopPropagation()}
                            >
                              <DollarSign className="mr-2 h-4 w-4" />
                              Update Payment Status
                            </DropdownMenuItem>
                          )}

                        {listing.status === 'OPEN' &&
                          !!listing.isPublished &&
                          !listing.isWinnersAnnounced && (
                            <DropdownMenuItem
                              className="cursor-pointer text-sm font-medium text-slate-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnpublish(listing);
                              }}
                              onAuxClick={(e) => e.stopPropagation()}
                            >
                              <EyeOff className="mr-2 h-4 w-4" />
                              Unpublish
                            </DropdownMenuItem>
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
    </>
  );
};
