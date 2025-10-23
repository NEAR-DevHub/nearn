import { type MilestoneWithUser } from '@/interface/submission';

import { type Listing } from '@/features/listings/types';

import { PaymentButton } from '../Shared/PaymentButton';
import { DisplayPayment } from '../Submissions/DisplayPayment';
import ApproveMilestoneButton from './ApproveMilestoneButton';

interface Props {
  milestone: MilestoneWithUser;
  listing: Listing;
  handleOpenVerifyPaymentModal: () => void;
  handleOpenNearTreasuryModal: () => void;
  handleOpenManualPaymentModal: () => void;
}

export default function MilestoneActionButton({
  milestone,
  listing,
  handleOpenVerifyPaymentModal,
  handleOpenNearTreasuryModal,
  handleOpenManualPaymentModal,
}: Props) {
  return (
    <>
      {milestone.status === 'InReview' && (
        <ApproveMilestoneButton milestoneId={milestone.id} />
      )}
      {milestone.status === 'Approved' && (
        <PaymentButton
          milestone={milestone}
          size="sm"
          onVerifyPayment={handleOpenVerifyPaymentModal}
          setIsNearTreasuryPaymentModalOpen={handleOpenNearTreasuryModal}
          onManualPaymentOpen={handleOpenManualPaymentModal}
        />
      )}
      {milestone.status === 'Paid' && (
        <DisplayPayment
          milestone={milestone}
          listing={listing}
          isSponsorView={true}
        />
      )}
    </>
  );
}
