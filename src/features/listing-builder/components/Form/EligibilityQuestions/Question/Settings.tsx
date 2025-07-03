import { Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { useListingForm } from '@/features/listing-builder/hooks';

interface QuestionSettingsPopoverProps {
  index: number;
}

export default function QuestionSettingsPopover({
  index,
}: QuestionSettingsPopoverProps) {
  const form = useListingForm();

  const changeBoolean = (field: any) => {
    field.onChange(!field.value);
    form.saveDraft();
  };
  return (
    <FormField
      control={form.control}
      name={`eligibility.${index}.optional`}
      render={({ field }) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-auto p-1 text-muted-foreground text-slate-500 hover:bg-transparent hover:text-slate-600"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="left" className="w-72 p-4" align="end">
            <div className="space-y-2">
              <h4 className="font-medium">Question Options</h4>
              <div className="flex flex-row items-start space-x-3 space-y-0">
                <Checkbox
                  checked={field.value === true}
                  onClick={() => changeBoolean(field)}
                />
                <div
                  className="cursor-pointer space-y-1 leading-none"
                  onClick={() => changeBoolean(field)}
                >
                  <FormLabel className="cursor-pointer">Optional</FormLabel>
                  <FormDescription className="text-xs">
                    Makes the question optional for applicants
                  </FormDescription>
                  <FormMessage />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    />
  );
}
