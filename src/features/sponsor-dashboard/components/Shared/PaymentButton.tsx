import { useQuery } from '@tanstack/react-query';
import { DollarSign, ExternalLink, Link2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type Dispatch, type SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { type MilestoneWithUser } from '@/interface/submission';
import { getURLSanitized } from '@/utils/getURLSanitized';

import { treasuryProposalStatusQuery } from '@/features/treasury/queries/treasuryProposalStatus';

interface PaymentButtonProps {
  milestone: MilestoneWithUser;
  size?: 'sm' | 'default';
  onVerifyPayment: () => void;
  setIsNearTreasuryPaymentModalOpen: Dispatch<SetStateAction<boolean>>;
  onManualPaymentOpen: () => void;
}

export const PaymentButton = ({
  milestone,
  onVerifyPayment,
  setIsNearTreasuryPaymentModalOpen,
  onManualPaymentOpen,
  size = 'default',
}: PaymentButtonProps) => {
  const treasury = milestone?.paymentDetails?.treasury;
  const { data: proposalStatus, isLoading: isLoadingProposalStatus } = useQuery(
    treasuryProposalStatusQuery(treasury?.dao, treasury?.proposalId ?? 0),
  );

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

  const paymentTypes = [
    {
      label: 'Add Payment Link',
      description:
        'Pay the contributor using your preferred method, then paste the transaction link here.',
      icon: <Link2 className="mx-0.5 mt-0.5 h-4 w-4 shrink-0 text-slate-500" />,
      onClick: () => onVerifyPayment(),
    },
    {
      label: 'Add Manual Payment',
      description:
        'Make the payment via your preferred channel, then enter the transaction manually.',
      icon: (
        <DollarSign className="mx-0.5 mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
      ),
      onClick: () => onManualPaymentOpen(),
    },
    {
      label: 'Pay with NEAR Treasury',
      description:
        'Create a payment request through NEAR Treasury and approve it on-chain.',
      icon: (
        <Image
          src="/assets/NEARTreasuryLogo.svg"
          alt="NEAR Treasury Logo"
          width={20}
          height={20}
        />
      ),
      onClick: () => setIsNearTreasuryPaymentModalOpen(true),
    },
  ];

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          className="ph-no-capture min-w-[120px] disabled:cursor-not-allowed"
          size={size}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Complete Payment
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="flex w-full max-w-[376px] flex-col gap-2 p-2"
      >
        {paymentTypes.map((paymentType) => (
          <Button
            key={paymentType.label}
            onClick={paymentType.onClick}
            variant="ghost"
            className="flex h-full w-full items-start gap-2 rounded-sm p-2"
          >
            {paymentType.icon}
            <div className="flex flex-col text-left">
              <p className="font-medium text-slate-500">{paymentType.label}</p>
              <p className="text-wrap text-sm text-slate-400">
                {paymentType.description}
              </p>
            </div>
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
