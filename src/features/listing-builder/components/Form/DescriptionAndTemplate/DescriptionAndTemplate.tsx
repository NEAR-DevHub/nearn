import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';

import { MinimalTiptapEditor } from '@/components/tiptap';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

import { descriptionKeyAtom } from '@/features/listing-builder/atoms';

import { useListingForm } from '../../../hooks';
import { Templates } from './Templates';

export function DescriptionAndTemplate() {
  const form = useListingForm();
  const templateId = useWatch({
    control: form.control,
    name: 'templateId',
  });

  const [descriptionKey, setDescriptionKey] = useAtom(descriptionKeyAtom);

  useEffect(() => {
    setDescriptionKey(`editor-${templateId || 'default'}`);
  }, [templateId]);

  return (
    <>
      <FormField
        name="description"
        control={form.control}
        render={({ field }) => {
          return (
            <FormItem className="gap-2">
              <div className="flex rounded-md border ring-primary has-[:focus]:ring-1">
                <FormControl>
                  <MinimalTiptapEditor
                    key={descriptionKey}
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e);
                      form.saveDraft();
                    }}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    className="min-h-[60vh] w-full border-0 text-sm"
                    editorContentClassName="p-4 px-2 h-full"
                    output="html"
                    placeholder="Type your description here..."
                    editable={true}
                    editorClassName="focus:outline-none"
                    imageSetting={{
                      folderName: 'listing-description',
                      type: 'description',
                    }}
                    toolbarClassName="sticky rounded-t-md top-0 bg-white z-10"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <Templates />
    </>
  );
}
