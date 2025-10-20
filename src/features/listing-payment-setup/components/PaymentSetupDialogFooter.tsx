import { type FieldErrors } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { LocalImage } from '@/components/ui/local-image';
import { SheetFooter } from '@/components/ui/sheet';

import { PaymentMode } from '../constants';

interface PaymentSetupDialogFooterProps {
  totalAmount: number;
  currentAmount?: number;
  tokenSymbol: string;
  tokenIconSrc: string;
  paymentMode: PaymentMode;
  isSubmitting?: boolean;
  errors?: FieldErrors;
}

const getAmountText = (
  totalAmount: number,
  currentAmount: number | undefined,
  paymentMode: PaymentMode,
) => {
  if (paymentMode === PaymentMode.MILESTONE && currentAmount != null) {
    return `${currentAmount}/${totalAmount}`;
  }
  return totalAmount;
};

export function PaymentSetupDialogFooter({
  totalAmount,
  currentAmount,
  tokenSymbol,
  tokenIconSrc,
  paymentMode,
  isSubmitting = false,
  errors,
}: PaymentSetupDialogFooterProps) {
  const isDisabled =
    paymentMode === PaymentMode.MILESTONE && currentAmount !== totalAmount;

  return (
    <SheetFooter className="border-t p-6">
      <div className="flex w-full flex-col items-center space-y-6">
        <div className="w-full space-y-1">
          <div className="flex w-full items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total Prize
            </span>
            <div className="flex items-center gap-2">
              <LocalImage
                className="h-5 w-5 rounded-full"
                alt="Token icon"
                src={tokenIconSrc}
              />
              <span className="font-semibold text-slate-900">
                {getAmountText(totalAmount, currentAmount, paymentMode)}{' '}
                {tokenSymbol}
              </span>
            </div>
          </div>
          {paymentMode === PaymentMode.MILESTONE && (
            <p className="mt-1 w-full text-left text-xs text-slate-600">
              The total of all milestones must match the overall prize pool to
              continue
            </p>
          )}
          {errors?.root && (
            <p className="mt-1 w-full text-left text-xs text-red-600">
              {errors.root.message}
            </p>
          )}
        </div>
        <Button
          className="w-full"
          type="submit"
          disabled={isDisabled || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </SheetFooter>
  );
}
