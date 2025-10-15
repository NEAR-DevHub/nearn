import dayjs from 'dayjs';
import { Info, Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { TokenSelect } from '@/components/eligibility/EligibilityQuestions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { TokenInput } from '@/components/ui/token-input';
import { Tooltip } from '@/components/ui/tooltip';
import { type MilestoneWithUser } from '@/interface/submission';
import { cn } from '@/utils/cn';

import { DEADLINE_FORMAT } from '@/features/listing-builder/components/Form/Deadline';

interface AddManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: MilestoneWithUser;
  onSuccess: (paymentData: {
    amount: number;
    token: string;
    paymentDate: string;
    notes: string;
    isPublic: boolean;
  }) => void;
}

type FormData = {
  paymentDate: string;
  token: string;
  fiatCurrency?: string;
  amount: number;
  notes: string;
  isPrivate: boolean;
};

export default function AddManualPaymentModal({
  isOpen,
  onClose,
  milestone,
  onSuccess,
}: AddManualPaymentModalProps) {
  const form = useForm<FormData>({
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0],
      token: 'Near',
      amount: 0,
      notes: '',
      isPrivate: false,
    },
  });

  const fiatCurrency = form.watch('fiatCurrency');
  const token = form.watch('token');
  useEffect(() => {
    if (token === 'Fiat' && !fiatCurrency) {
      form.setValue('fiatCurrency', 'USD');
    } else if (token !== 'Fiat') {
      form.setValue('fiatCurrency', undefined);
    }
  }, [token]);

  const isUpdating = milestone && milestone.paymentDetails?.manual;

  useEffect(() => {
    if (isUpdating && milestone.paymentDetails?.manual) {
      const manualPayment = milestone.paymentDetails.manual;
      form.reset({
        paymentDate: manualPayment.paymentDate,
        token: manualPayment.token,
        fiatCurrency: manualPayment.fiatCurrency,
        amount: manualPayment.amount,
        notes: manualPayment.notes,
        isPrivate: !manualPayment.isPublic,
      });
    } else if (milestone) {
      form.reset({
        paymentDate: new Date().toISOString().split('T')[0],
        token: milestone.token,
        amount: milestone.reward,
        notes: '',
        isPrivate: false,
      });
    }
  }, [milestone]);

  const handleSubmit = async (data: FormData) => {
    try {
      const response = await fetch(
        '/api/sponsor-dashboard/submission/add-manual-payment',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: milestone.id,
            amount: data.amount,
            token: data.token,
            fiatCurrency: data.fiatCurrency,
            paymentDate: data.paymentDate,
            notes: data.notes,
            isPublic: !data.isPrivate,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to add manual payment');
      }

      onSuccess({ ...data, isPublic: !data.isPrivate });
      onClose();
    } catch (error) {
      console.error('Error adding manual payment:', error);
      toast.error('Failed to add manual payment');
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-slate text-xl font-bold">
            {isUpdating ? 'Update Manual Payment' : 'Add Manual Payment'}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Make the payment via your preferred channel, then enter the
            transaction manually.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="space-y-4">
              <FormField
                name="paymentDate"
                control={form.control}
                render={({ field }) => {
                  return (
                    <FormItem className="gap-2">
                      <FormLabel isRequired>Payment Date</FormLabel>
                      <div className="has-focus:ring-1 flex rounded-md border ring-primary has-[data-[state=open]]:ring-1">
                        <DateTimePicker
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          onChange={(date) => {
                            if (date) {
                              const formattedDate =
                                dayjs(date).format(DEADLINE_FORMAT);
                              const localFormat = formattedDate.replace(
                                'Z',
                                '',
                              );
                              field.onChange(localFormat);
                            } else {
                              field.onChange(undefined);
                            }
                          }}
                          hideTime
                          classNames={{
                            trigger: 'border-0',
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <TokenSelect
                control={form.control}
                name="token"
                hideDescription
                includeFiat
              />
              <FormField
                control={form.control}
                name={'amount' as any}
                render={({ field }) => (
                  <FormItem className={cn('flex flex-col gap-2')}>
                    <FormLabel isRequired>Payment Amount</FormLabel>
                    <div>
                      <FormControl>
                        <TokenInput
                          token={token}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                          fiatValue={fiatCurrency}
                          onFiatChange={(e) => {
                            form.setValue('fiatCurrency', e);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="pt-1" />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={'notes' as any}
                render={({ field }) => (
                  <FormItem className="gap-2">
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter any additional info about the payment..."
                        className="min-h-[80px] resize-none overflow-hidden font-medium !text-muted-foreground shadow-none"
                        value={field.value || ''}
                        onBlur={() => null}
                        rows={1}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={'isPrivate' as any}
                render={({ field }) => (
                  <FormItem className="gap-2">
                    <FormControl>
                      <div className="flex items-center justify-start gap-2">
                        <Checkbox
                          checked={field.value === true}
                          onClick={() => field.onChange(!field.value)}
                        />
                        <FormLabel>Keep note private</FormLabel>
                        <Tooltip
                          contentProps={{ className: 'z-[1000]' }}
                          content="This note will be visible only for the contributor and your sponsor team - hidden from others. The date, amount and currency will be visible to everyone."
                        >
                          <Info className="h-4 w-4 text-slate-500" />
                        </Tooltip>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isUpdating ? (
                    'Update'
                  ) : (
                    'Complete'
                  )}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
