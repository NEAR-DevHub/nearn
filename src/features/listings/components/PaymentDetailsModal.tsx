import { Flag } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { tokenList } from '@/constants/tokenList';
import { dayjs } from '@/utils/dayjs';

interface ManualPaymentData {
  amount: number;
  currency: string;
  paymentDate: string;
  notes?: string;
  isPublic?: boolean;
}

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: ManualPaymentData;
  submissionId: string;
  isOwner: boolean;
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  paymentData,
  submissionId,
  isOwner,
}: PaymentDetailsModalProps) {
  const [isReporting, setIsReporting] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportDescription, setReportDescription] = useState('');

  const token = tokenList.find((t) => t.tokenSymbol === paymentData.currency);

  const handleReportIssue = async () => {
    if (!reportDescription.trim()) {
      toast.error('Please describe the issue');
      return;
    }

    try {
      setIsReporting(true);

      const response = await fetch('/api/submission/report-payment-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          description: reportDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to report issue');
      }

      toast.success('Issue reported successfully');
      setShowReportForm(false);
      setReportDescription('');
      onClose();
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error('Failed to report issue');
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0">
        <DialogHeader className="px-4 pb-2 pt-4">
          <DialogTitle className="text-base font-medium">
            Payment Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-12 px-4 pb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base text-slate-600">Payment Date</Label>
              <p className="text-base font-medium">
                {dayjs(paymentData.paymentDate).format('MMM D, YYYY')}
              </p>
            </div>
            <Separator />

            <div className="flex items-center justify-between">
              <Label className="text-base text-slate-600">Currency</Label>
              <div className="flex items-center gap-2">
                {token?.icon && (
                  <img
                    src={token.icon}
                    alt={paymentData.currency}
                    className="h-4 w-4 rounded-full"
                  />
                )}
                <p className="text-base font-medium">{paymentData.currency}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label className="text-base text-slate-600">Amount</Label>
              <p className="text-base font-medium">
                {paymentData.amount.toLocaleString('en-us')}
              </p>
            </div>

            {paymentData.notes && (paymentData.isPublic || isOwner) && (
              <div className="flex items-start justify-between">
                <Label className="text-base text-slate-600">Note</Label>
                <p className="max-w-[180px] text-right text-base text-slate-700">
                  {paymentData.notes}
                </p>
              </div>
            )}
          </div>

          {isOwner && (
            <div className="flex justify-center border-t pt-2">
              <button
                onClick={() => setShowReportForm(true)}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
              >
                <Flag className="h-3 w-3" />
                Having some trouble? Contact sponsor
              </button>
            </div>
          )}

          {showReportForm && (
            <div className="space-y-3 border-t pt-4">
              <div>
                <Label
                  htmlFor="reportDescription"
                  className="text-sm font-medium"
                >
                  Describe the issue
                </Label>
                <Textarea
                  id="reportDescription"
                  placeholder="Haven't received payment, wrong amount, etc."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>

              <div className="rounded-lg bg-yellow-50 p-3">
                <p className="text-xs text-yellow-700">
                  <strong>Disclaimer:</strong> Submitting this form does not
                  trigger an investigation or guarantee any follow-up. All
                  payment agreements are between sponsors and contributors.
                  NEARN won&apos;t mediate disputes, but we&apos;ll use this
                  data to improve future flows.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowReportForm(false);
                    setReportDescription('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReportIssue}
                  disabled={isReporting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isReporting ? 'Reporting...' : 'Report Issue'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {!showReportForm && (
          <DialogFooter className="px-4 pb-4">
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
