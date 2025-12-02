import { useQuery } from '@tanstack/react-query';
import { CircleHelp, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

import { cn } from '@/utils/cn';
import { getURLSanitized } from '@/utils/getURLSanitized';

import { useSyncTreasuryStatus } from '@/features/sponsor-dashboard/mutations/useSyncTreasuryStatus';
import { treasuryProposalStatusQuery } from '@/features/treasury/queries/treasuryProposalStatus';

interface TreasuryStatusProps {
  treasury?: {
    dao?: string;
    proposalId?: number;
    synced?: boolean;
    link?: string;
  };
  milestoneIsPaid: boolean;
  milestoneId: string;
  updateSubmission: (status: string) => void;
}

export default function TreasuryStatus({
  treasury,
  milestoneIsPaid,
  milestoneId,
  updateSubmission,
}: TreasuryStatusProps) {
  const { data: proposalStatus, isLoading: isLoadingProposalStatus } = useQuery(
    treasuryProposalStatusQuery(treasury?.dao, treasury?.proposalId ?? 0),
  );
  const { mutate: syncTreasuryStatus } = useSyncTreasuryStatus();

  useEffect(() => {
    if (
      proposalStatus &&
      proposalStatus !== 'InProgress' &&
      !milestoneIsPaid &&
      !treasury?.synced
    ) {
      syncTreasuryStatus(
        { id: milestoneId },
        {
          onSuccess: () => {
            updateSubmission(proposalStatus);
          },
        },
      );
    }
  }, [proposalStatus, milestoneIsPaid, syncTreasuryStatus]);

  if (isLoadingProposalStatus || !proposalStatus || !treasury) {
    return <></>;
  }

  let className = '';
  let text = '';
  let image;
  switch (proposalStatus) {
    case 'InProgress':
      className = 'bg-yellow-100 text-amber-800';
      text = 'Pending Approval on NEAR Treasury';
      image = <CircleHelp className="mr-2 h-4 w-4" />;
      break;
    case 'Approved':
      className = 'bg-green-100 text-green-800';
      text = 'Approved';
      break;
    case 'Rejected':
      className = 'bg-red-100 text-red-500';
      text = 'Payment Has Been Rejected';
      image = <TriangleAlert className="mr-2 h-4 w-4" />;
      break;
    case 'Removed':
      className = 'bg-red-100 text-red-500';
      text = 'Payment Has Been Removed';
      image = <TriangleAlert className="mr-2 h-4 w-4" />;
      break;
    case 'Expired':
      className = 'bg-slate-100 text-slate-500';
      text = 'Payment Has Been Expired';
      break;
    case 'Failed':
      className = 'bg-red-100 text-red-500';
      text = 'Payment Has Failed';
      image = <TriangleAlert className="mr-2 h-4 w-4" />;
      break;
    default:
      className = 'bg-red-100 text-red-500';
      text = `Unknown Status: ${proposalStatus}`;
      image = <TriangleAlert className="mr-2 h-4 w-4" />;
      break;
  }

  return (
    <Link
      href={getURLSanitized(treasury?.link || '')}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('flex items-center rounded-md px-3 py-1', className)}
    >
      {image}
      {text}
    </Link>
  );
}
