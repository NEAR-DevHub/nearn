import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { tokenList } from '@/constants/tokenList';

interface ManualPaymentData {
  amount: number;
  currency: string;
  paymentDate: string;
  notes?: string;
  isPublic?: boolean;
}

interface UpdateManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  currentPaymentData: ManualPaymentData | null;
  onSuccess: () => void;
}

type ModalState = 'form' | 'loading' | 'success' | 'error';

export default function UpdateManualPaymentModal({
  isOpen,
  onClose,
  submissionId,
  currentPaymentData,
  onSuccess,
}: UpdateManualPaymentModalProps) {
  const [modalState, setModalState] = useState<ModalState>('form');
  const [formData, setFormData] = useState({
    paymentDate: '',
    currency: 'USD',
    amount: '',
    notes: '',
    isPublic: false,
  });

  const currencies = [
    'USD',
    'NEAR',
    'USDC',
    'USDT',
    ...tokenList.map((t) => t.tokenSymbol),
  ].filter((value, index, self) => self.indexOf(value) === index);

  useEffect(() => {
    if (currentPaymentData && isOpen) {
      setFormData({
        paymentDate: currentPaymentData.paymentDate.split('T')[0] as string,
        currency: currentPaymentData.currency,
        amount: currentPaymentData.amount.toString(),
        notes: currentPaymentData.notes || '',
        isPublic: currentPaymentData.isPublic || false,
      });
    }
  }, [currentPaymentData, isOpen]);

  const handleSubmit = async () => {
    if (!formData.amount || !formData.currency || !formData.paymentDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setModalState('loading');

      const response = await fetch(
        '/api/sponsor-dashboard/submission/update-manual-payment',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: submissionId,
            amount: formData.amount,
            currency: formData.currency,
            paymentDate: formData.paymentDate,
            notes: formData.notes,
            isPublic: formData.isPublic,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update manual payment');
      }

      setModalState('success');
      setTimeout(() => {
        onSuccess();
        onClose();
        setModalState('form');
      }, 2000);
    } catch (error) {
      console.error('Error updating manual payment:', error);
      setModalState('error');
      toast.error('Failed to update manual payment');
    }
  };

  const handleClose = () => {
    setModalState('form');
    onClose();
  };

  const renderContent = () => {
    switch (modalState) {
      case 'form':
        return (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Manual Payment</DialogTitle>
              <DialogDescription>
                Update the payment details for this submission.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date*</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency*</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => {
                      const token = tokenList.find(
                        (t) => t.tokenSymbol === currency,
                      );
                      return (
                        <SelectItem key={currency} value={currency}>
                          <div className="flex items-center gap-2">
                            {token?.icon && (
                              <img
                                src={token.icon}
                                alt={currency}
                                className="h-4 w-4 rounded-full"
                              />
                            )}
                            {currency}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount*</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="8000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Note</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional info about the payment"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="resize-none"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This note will be visible only to the contributor and your
                  sponsor team.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isPublic: checked }))
                  }
                />
                <Label htmlFor="isPublic" className="text-sm">
                  Keep note private
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Update</Button>
            </DialogFooter>
          </DialogContent>
        );

      case 'loading':
        return (
          <DialogContent hideCloseIcon>
            <div className="flex h-full flex-col">
              <div className="flex flex-col py-14">
                <div className="mb-4 flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-green" />
                </div>
                <div className="mx-auto mt-8 flex w-full flex-col items-center gap-2">
                  <DialogTitle>Updating manual payment...</DialogTitle>
                  <DialogDescription className="text-center text-sm text-slate-500">
                    Please wait while we update your payment details
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogContent>
        );

      case 'success':
        return (
          <DialogContent className="p-0" hideCloseIcon>
            <div className="flex h-40 items-center justify-center bg-emerald-50">
              <div className="rounded-full bg-emerald-600 p-3">
                <Check className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
            </div>
            <div className="p-6">
              <DialogTitle className="font-bold">
                Manual Payment Updated
              </DialogTitle>
              <DialogDescription className="mt-2">
                The payment details have been successfully updated.
              </DialogDescription>
            </div>
          </DialogContent>
        );

      case 'error':
        return (
          <DialogContent className="pt-0" hideCloseIcon>
            <div className="flex items-center justify-center py-10">
              <div className="flex items-center justify-center rounded-full bg-red-100 p-3">
                <div className="rounded-full bg-red-600 p-3">
                  <X className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="mx-auto mt-6 flex max-w-[20rem] flex-col items-center gap-2">
              <DialogTitle>Something went wrong</DialogTitle>
              <p className="text-center text-sm text-slate-500">
                We couldn&apos;t update the manual payment
              </p>
            </div>
            <div className="mx-auto mt-8 flex flex-col items-center gap-5">
              <Button onClick={() => setModalState('form')}>Try Again</Button>
              <Button
                variant="link"
                onClick={handleClose}
                className="text-slate-500"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {renderContent()}
    </Dialog>
  );
}
