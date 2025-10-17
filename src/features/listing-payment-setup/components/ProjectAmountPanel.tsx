import { Label } from '@/components/ui/label';
import { LocalImage } from '@/components/ui/local-image';

interface ProjectAmountPanelProps {
  projectAmount: number;
  tokenSymbol: string;
  tokenIconSrc: string;
}

export function ProjectAmountPanel({
  projectAmount,
  tokenSymbol,
  tokenIconSrc,
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
        <div className="space-x-2">
          <span className="font-semibold text-slate-900">{projectAmount}</span>
          <span className="font-semibold text-slate-400">{tokenSymbol}</span>
        </div>
      </div>
    </div>
  );
}
