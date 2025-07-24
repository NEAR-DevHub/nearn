import dayjs from 'dayjs';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

interface UpdateDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  listingId: string;
  currentDate?: string;
  onSuccess?: (date: string) => void;
}

export const UpdatePaymentDateModal = ({
  isOpen,
  onClose,
  submissionId,
  listingId,
  currentDate,
  onSuccess,
}: UpdateDateModalProps) => {
  const [newDate, setNewDate] = useState(currentDate || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!newDate) {
      toast.error('Please enter a valid date');
      return;
    }

    if (dayjs(newDate).isAfter(dayjs())) {
      toast.error('You cannot update the date to a future date');
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/api/sponsor-dashboard/listings/update-date', {
        submissionId,
        listingId,
        dateType: 'payment',
        date: newDate,
      });
      toast.success(`Payment date updated successfully`);
      onSuccess?.(newDate);
      onClose();
    } catch (error) {
      toast.error(`Failed to update payment date`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    return 'Update Payment Date';
  };

  const getButtonText = () => {
    return isLoading ? 'Updating...' : 'Update';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {getButtonText()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
