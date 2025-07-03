import {
  Baseline,
  CheckSquare,
  LetterText,
  Link2,
  ListCheck,
} from 'lucide-react';

import { FormControl, FormField, FormItem } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useListingForm } from '@/features/listing-builder/hooks';

const questionTypes: {
  value: QuestionType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: 'text', label: 'Text', icon: Baseline },
  { value: 'paragraph', label: 'Paragraph', icon: LetterText },
  { value: 'link', label: 'Link', icon: Link2 },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'select', label: 'Select', icon: ListCheck },
];

export type QuestionType =
  | 'text'
  | 'paragraph'
  | 'link'
  | 'checkbox'
  | 'select';

interface QuestionTypeSelectProps {
  index: number;
}

export default function QuestionTypeSelect({ index }: QuestionTypeSelectProps) {
  const form = useListingForm();

  return (
    <FormField
      control={form.control}
      name={`eligibility.${index}.type`}
      render={({ field }) => (
        <FormItem className="w-fit">
          <Select
            value={field.value}
            defaultValue="text"
            onValueChange={(value) => {
              field.onChange(value);
              if (value === 'checkbox') {
                form.setValue(`eligibility.${index}.description`, '');
              }
              if (value === 'select') {
                form.setValue(`eligibility.${index}.variants`, ['Variant 1']);
              } else {
                form.setValue(`eligibility.${index}.variants`, null);
              }
            }}
          >
            <FormControl>
              <SelectTrigger className="h-fit w-fit gap-1 rounded-none border-0 py-2 focus:ring-0">
                <SelectValue className="w-fit">
                  {(() => {
                    const selectedType = questionTypes.find(
                      (type) => type.value === field.value,
                    );
                    if (!selectedType) return 'Type';
                    const Icon = selectedType.icon;
                    return (
                      <Icon className="h-[14px] w-[14px] text-slate-500" />
                    );
                  })()}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {questionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2 text-slate-500">
                    <type.icon className="h-[14px] w-[14px]" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}
