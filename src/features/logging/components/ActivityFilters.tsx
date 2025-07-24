import { ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/utils/cn';

interface Properties {
  sort: 'asc' | 'desc';
  value: string;
  supportedValues: {
    label: string;
    value: string;
  }[];
  onValueChange: (value: string) => void;
  onSortChange: (value: 'asc' | 'desc') => void;
}

export default function ActivityFilters({
  sort,
  value,
  supportedValues,
  onValueChange,
  onSortChange,
}: Properties) {
  return (
    <>
      <Select
        value={value}
        onValueChange={(value) =>
          onValueChange(
            value as 'all' | 'listing' | 'submission' | 'payments' | 'comments',
          )
        }
      >
        <SelectTrigger className="max-w-32 text-slate-500">
          <SelectValue placeholder="Select an option..." />
        </SelectTrigger>
        <SelectContent>
          {supportedValues.map(({ label, value }) => (
            <SelectItem key={value} value={value} className="text-slate-500">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        className="size-8 rounded-lg p-4 text-slate-400"
        onClick={() => onSortChange(sort === 'asc' ? 'desc' : 'asc')}
      >
        <div className="flex flex-col items-center justify-center">
          <ChevronUp
            className={cn(
              'mb-[-4px] h-3 w-3 transition-colors',
              sort === 'asc'
                ? 'text-slate-600'
                : 'text-slate-400 hover:text-slate-500',
            )}
          />
          <ChevronDown
            className={cn(
              'h-3 w-3 transition-colors',
              sort === 'desc'
                ? 'text-slate-700'
                : 'text-slate-400 hover:text-slate-500',
            )}
          />
        </div>
      </Button>
    </>
  );
}
