import { Label } from '@/components/ui/label';
import { LocalImage } from '@/components/ui/local-image';
import { cn } from '@/utils/cn';

interface ProjectAmountPanelProps {
  projectAmount: number;
  tokenSymbol: string;
  tokenIconSrc: string;
  isUsdBased: boolean;
}

export function ProjectAmountPanel({
  projectAmount,
  tokenSymbol,
  tokenIconSrc,
  isUsdBased,
}: ProjectAmountPanelProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-600">
        Project Amount
      </Label>
      <div className="flex items-center gap-2">
        <LocalImage
          className="h-5 w-5 rounded-full"
          alt="token"
          src={tokenIconSrc}
        />
        <div className="space-x-2 font-semibold text-slate-900">
          <span className="ml-1 truncate text-sm">
            {isUsdBased && '$'}
            {projectAmount ? projectAmount.toLocaleString('en-US') : '0'}
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
  );
}
