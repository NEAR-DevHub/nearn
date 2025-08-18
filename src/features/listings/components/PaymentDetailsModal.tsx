import { Flag } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { tokenList } from '@/constants/tokenList';
import { useUser } from '@/store/user';
import { dayjs } from '@/utils/dayjs';
import { getURLSanitized } from '@/utils/getURLSanitized';

import { type Listing } from '../types';

interface ManualPaymentData {
  amount: number;
  token: string;
  paymentDate: string;
  notes?: string;
}

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: ManualPaymentData;
  submissionId: string;
  listing: Listing;
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  paymentData,
  submissionId,
  listing,
}: PaymentDetailsModalProps) {
  const { user } = useUser();
  const token = tokenList.find((t) => t.tokenSymbol === paymentData.token);

  const handleReportIssue = async () => {
    if (!user) {
      return;
    }

    try {
      await fetch('/api/n8n/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'report-payment-issue',
          submissionId,
        }),
      });
      onClose();
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error('Failed to report issue');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm gap-4 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Payment Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <Label className="text-slate-500">Payment Date</Label>
            <p className="font-medium text-slate-900">
              {dayjs(paymentData.paymentDate).format('MMM D, YYYY')}
            </p>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <Label className="text-slate-500">Currency</Label>
            <div className="flex items-center gap-2">
              {token?.icon && (
                <img
                  src={token.icon}
                  alt={paymentData.token}
                  className="h-4 w-4 rounded-full"
                />
              )}
              <p className="font-medium text-slate-900">{paymentData.token}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-slate-500">Amount</Label>
            <p className="font-medium text-slate-900">
              {paymentData.amount.toLocaleString('en-us')}
            </p>
          </div>
        </div>

        {paymentData.notes && (
          <div className="flex flex-col gap-2">
            <Label className="text-slate-500">Note</Label>
            <p className="font-medium text-slate-600">{paymentData.notes}</p>
          </div>
        )}

        {listing.pocSocials && (
          <div className="flex justify-center pt-6">
            <Link
              href={getURLSanitized(listing.pocSocials ?? '')}
              target="_blank"
              onClick={() => handleReportIssue()}
              className="flex gap-1 text-xs text-red-500 hover:text-red-600"
            >
              <Flag className="h-4 w-4" />
              <span className="mt-auto">
                Having some trouble? Contact sponsor
              </span>
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
