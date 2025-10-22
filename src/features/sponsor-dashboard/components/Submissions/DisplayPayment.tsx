import { DollarSign, Link2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { type MilestoneWithUser } from '@/interface/submission';
import { getURLSanitized } from '@/utils/getURLSanitized';

import PaymentDetailsModal from '@/features/listings/components/PaymentDetailsModal';
import { type Listing } from '@/features/listings/types';

import AddManualPaymentModal from './Modals/AddManualPaymentModal';

interface DisplayPaymentProps {
  milestone: MilestoneWithUser;
  listing: Listing;
  size?: 'default' | 'sm';
  className?: string;
  isSponsorView: boolean;
}

export function DisplayPayment({
  milestone,
  listing,
  size = 'default',
  className,
  isSponsorView,
}: DisplayPaymentProps) {
  const [isPaymentDetailsModalOpen, setIsPaymentDetailsModalOpen] =
    useState(false);

  if (milestone.status !== 'Paid') {
    return null;
  }

  const paymentType = milestone.paymentDetails?.link
    ? 'external'
    : milestone.paymentDetails?.manual
      ? 'manual'
      : milestone.paymentDetails?.treasury?.link
        ? 'treasury'
        : 'marked';

  switch (paymentType) {
    case 'external':
      return (
        <Tooltip content="On-chain payment" contentProps={{ side: 'top' }}>
          <Button
            className={className || 'text-slate-500'}
            onClick={() => {
              window.open(
                getURLSanitized(milestone.paymentDetails?.link ?? ''),
                '_blank',
              );
            }}
            size={size}
            variant="outline"
          >
            <Link2 className="mr-2 h-4 w-4" />
            View Payment
          </Button>
        </Tooltip>
      );

    case 'manual':
      return (
        <>
          <Tooltip content="Paid manually" contentProps={{ side: 'top' }}>
            <Button
              className={className || 'text-slate-500'}
              onClick={() => setIsPaymentDetailsModalOpen(true)}
              size={size}
              variant="outline"
            >
              <DollarSign className="mr-2 h-4 w-4" />
              View Payment
            </Button>
          </Tooltip>

          {isSponsorView ? (
            <AddManualPaymentModal
              isOpen={isPaymentDetailsModalOpen}
              onClose={() => setIsPaymentDetailsModalOpen(false)}
              milestone={milestone}
              listingToken={listing.token}
              onSuccess={() => {
                setIsPaymentDetailsModalOpen(false);
              }}
            />
          ) : (
            <PaymentDetailsModal
              isOpen={isPaymentDetailsModalOpen}
              onClose={() => setIsPaymentDetailsModalOpen(false)}
              paymentData={milestone.paymentDetails?.manual as any}
              submissionId={milestone.submissionId}
              listing={listing}
            />
          )}
        </>
      );

    case 'treasury':
      return (
        <Tooltip
          content="Paid via NEAR Treasury"
          contentProps={{ side: 'top' }}
        >
          <Button
            className={className || 'text-slate-500'}
            onClick={() => {
              window.open(
                getURLSanitized(milestone.paymentDetails?.treasury?.link ?? ''),
                '_blank',
              );
            }}
            size={size}
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
          </Button>
        </Tooltip>
      );

    case 'marked':
    default:
      return (
        <Tooltip
          content="Payment details are hidden because the contributor’s profile is marked as private."
          contentProps={{ side: 'top' }}
        >
          <Button
            className={className || 'gap-2 text-slate-500'}
            disabled
            size={size}
            variant="outline"
          >
            <DollarSign className="h-4 w-4" />
            <p>View payment</p>
          </Button>
        </Tooltip>
      );
  }
}
