import { type FieldErrors } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { LocalImage } from '@/components/ui/local-image';
import { SheetFooter } from '@/components/ui/sheet';
import { cn } from '@/utils/cn';

import { PaymentMode } from '../constants';

interface PaymentSetupDialogFooterProps {
  totalAmount: number;
  currentAmount?: number;
  tokenSymbol: string;
  tokenIconSrc: string;
  paymentMode: PaymentMode;
  isUsdBased: boolean;
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
  isUsdBased,
  isSubmitting = false,
  errors,
}: PaymentSetupDialogFooterProps) {
  const isDisabled =
    paymentMode === PaymentMode.MILESTONE && currentAmount !== totalAmount;
  const amount = getAmountText(totalAmount, currentAmount, paymentMode);

  return (
    <SheetFooter className="border-t p-6">
      <div className="flex w-full flex-col items-center space-y-6">
        <div className="w-full space-y-1">
          <div className="flex w-full items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total Payment
            </span>
            <div className="flex items-center gap-2">
              <LocalImage
                className="h-5 w-5 rounded-full"
                alt="Token icon"
                src={tokenIconSrc}
              />
              <div className="space-x-2 font-semibold text-slate-900">
                <span className="ml-1 truncate text-sm">
                  {isUsdBased && '$'}
                  {amount ? amount.toLocaleString('en-US') : '0'}
                  <span className="text-slate-500">
                    {isUsdBased && ' to be paid in'}
                  </span>
                  <span
                    className={cn(
                      'ml-1',
                      !isUsdBased && 'font-semibold text-slate-900',
                    )}
                  >
                    {tokenSymbol}
                  </span>
                </span>
              </div>
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
