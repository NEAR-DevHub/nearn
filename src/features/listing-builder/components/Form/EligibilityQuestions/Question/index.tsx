import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, GripVertical, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { type FieldArrayWithId, useWatch } from 'react-hook-form';

import { RichEditor } from '@/components/shared/RichEditor';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/cn';

import { useListingForm } from '@/features/listing-builder/hooks';

import QuestionSelectVariants from './SelectVariants';
import QuestionSettingsPopover from './Settings';
import QuestionTypeSelect, { type QuestionType } from './Type';

interface EligibilityQuestionProps {
  index: number;
  id: string;
  fields: FieldArrayWithId<any, 'eligibility', 'id'>[];
  handleRemoveQuestion: (index: number) => void;
  handleDuplicateQuestion: (
    question: string,
    type: QuestionType,
    description: string,
    optional: boolean,
    variants: string[] | null,
    sourceIndex: number,
  ) => void;
}

export default function EligibilityQuestion({
  index,
  fields,
  handleRemoveQuestion,
  handleDuplicateQuestion,
  id,
}: EligibilityQuestionProps) {
  const form = useListingForm();
  const type = useWatch({
    control: form.control,
    name: 'type',
  });
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: '100%',
    height: 'auto',
  };

  const optional = useWatch({
    control: form.control,
    name: `eligibility.${index}.optional`,
  });
  const questionType = useWatch({
    control: form.control,
    name: `eligibility.${index}.type`,
  });
  const question = useWatch({
    control: form.control,
    name: `eligibility.${index}.question`,
  });
  const description = useWatch({
    control: form.control,
    name: `eligibility.${index}.description`,
  });
  const variants = useWatch({
    control: form.control,
    name: `eligibility.${index}.variants`,
  });

  // Add useEffect to adjust textarea height on mount and value change
  useEffect(() => {
    const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };

    const questionTextarea = document.querySelector(
      `textarea[name="eligibility.${index}.question"]`,
    ) as HTMLTextAreaElement;
    const descriptionTextarea = document.querySelector(
      `textarea[name="eligibility.${index}.description"]`,
    ) as HTMLTextAreaElement;

    if (questionTextarea) {
      adjustTextareaHeight(questionTextarea);
    }
    if (descriptionTextarea) {
      adjustTextareaHeight(descriptionTextarea);
    }
  }, [index]);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto';
      descriptionRef.current.style.height =
        descriptionRef.current.scrollHeight + 'px';
    }
  }, [descriptionRef.current]);

  return (
    <div className="bg-white" ref={setNodeRef} style={style}>
      <FormField
        control={form.control}
        name={`eligibility.${index}.question`}
        render={() => {
          return (
            <div className="group relative">
              <FormItem className="rounded-lg border">
                <div
                  className={cn(
                    'flex cursor-grab items-center justify-between border-b active:cursor-grabbing',
                    isDragging && 'opacity-50',
                  )}
                  {...attributes}
                  {...listeners}
                >
                  <div className="flex gap-2">
                    <div className="flex justify-around">
                      <div className="flex items-center gap-2">
                        <GripVertical className="ml-2 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                    <FormLabel
                      isRequired={
                        (type === 'project' || type === 'sponsorship') &&
                        index === 0
                      }
                      className="after:content-none"
                    >
                      <span className="text-muted-foreground">
                        Question {index + 1}
                      </span>
                    </FormLabel>
                  </div>
                  <Button
                    onClick={() => {
                      form.setValue(`eligibility.${index}.optional`, !optional);
                      form.saveDraft();
                    }}
                    variant="ghost"
                    className={cn(
                      'ml-auto h-fit rounded-md px-[6px] py-[2px] text-xs',
                      optional
                        ? 'bg-slate-50 text-slate-500'
                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-600',
                    )}
                  >
                    {optional ? 'Optional Question' : 'Required Question'}
                  </Button>
                  <QuestionTypeSelect index={index} />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name={`eligibility.${index}.question`}
                    render={({ field }) => (
                      <FormItem className="">
                        <FormControl>
                          {questionType === 'checkbox' ? (
                            <RichEditor
                              {...field}
                              id={`eligibilityAnswers.${index}.answer`}
                              value={field.value || ''}
                              onChange={(e) => {
                                field.onChange(e);
                                form.saveDraft();
                              }}
                              error={false}
                              placeholder={'Enter text for checkbox...'}
                              className="border-none ring-transparent focus-visible:ring-0 [&_p]:text-muted-foreground"
                            />
                          ) : (
                            <Textarea
                              {...field}
                              placeholder="Enter your question"
                              className="min-h-[20px] resize-none overflow-hidden border-none font-medium !text-muted-foreground shadow-none focus-visible:ring-0"
                              value={field.value || ''}
                              onChange={(e) => {
                                field.onChange(e);
                                form.saveDraft();
                                e.target.style.height = 'auto';
                                e.target.style.height =
                                  e.target.scrollHeight + 'px';
                              }}
                              onBlur={() => null}
                              rows={1}
                            />
                          )}
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`eligibility.${index}.order`}
                    render={({ field }) => (
                      <input type="hidden" {...field} value={index + 1} />
                    )}
                  />

                  {questionType !== 'checkbox' &&
                    question &&
                    question.length > 0 && (
                      <FormField
                        control={form.control}
                        name={`eligibility.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="h-full">
                            <FormControl>
                              <Textarea
                                {...field}
                                ref={descriptionRef}
                                placeholder="Write a description if necessary"
                                className={cn(
                                  'h-fit min-h-[20px] resize-none overflow-hidden border-none pt-0 !text-xs !text-muted-foreground shadow-none ring-transparent transition-transform duration-300 ease-out animate-in slide-in-from-top-4 focus-visible:ring-0',
                                  field.value && 'opacity-100',
                                )}
                                value={field.value || ''}
                                rows={1}
                                onChange={(e) => {
                                  field.onChange(e);
                                  form.saveDraft();
                                  e.target.style.height = 'auto';
                                  e.target.style.height =
                                    e.target.scrollHeight + 'px';
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                </div>
                {questionType === 'select' && (
                  <QuestionSelectVariants index={index} />
                )}
              </FormItem>
              <FormMessage />

              <div className="absolute right-0 top-0 flex translate-x-full transform opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex flex-col">
                  {(fields.length !== 1 ||
                    (type !== 'project' && type !== 'sponsorship')) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 p-0 text-slate-500 hover:bg-transparent hover:text-destructive"
                      onClick={() => handleRemoveQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-1 h-5 p-0 text-slate-500 hover:bg-transparent hover:text-slate-600"
                    onClick={() =>
                      handleDuplicateQuestion(
                        question,
                        questionType,
                        description ?? '',
                        optional,
                        variants ?? null,
                        index,
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <QuestionSettingsPopover index={index} />
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
