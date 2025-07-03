import { FilePen, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { EligibilityQuestions as EligibilityQuestionsPreview } from '@/components/eligibility/EligibilityQuestions';
import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';

import { useListingForm } from '@/features/listing-builder/hooks';

import { DefaultEligibilityQuestions } from './DefaultQs';
import { EligibilityQuestionsForm } from './QuestionsForm';

function SubmissionLimit() {
  const form = useListingForm();
  const type = useWatch({
    control: form.control,
    name: 'type',
  });

  const value = type === 'sponsorship' ? 'multiple' : 'single';
  const description =
    type === 'sponsorship'
      ? 'Multiple submissions are allowed throughout the bounty period'
      : 'Contributors can submit only once during the entire bounty period';

  return (
    <div className="flex justify-between">
      <div className="">
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium text-slate-500">Submission Limit</p>
          <Tooltip
            contentProps={{ style: { zIndex: 1000 } }}
            content={
              <p className="text-xs text-slate-500">
                Contributors can submit only one submission for bounties and
                projects. For sponsorships, additional submissions can be sent
                after the previous one is approved or rejected.
              </p>
            }
          >
            <Info className="h-3 w-3 text-slate-400" />
          </Tooltip>
        </div>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <Select value={value} disabled>
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Select a limit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem className="w-52" value="multiple">
            Multiple submissions
          </SelectItem>
          <SelectItem className="w-52" value="single">
            Only one submission
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function EligibilityQuestionsSheet() {
  const form = useListingForm();
  const [open, setOpen] = useState(false);

  const type = useWatch({
    control: form.control,
    name: 'type',
  });
  const compensationType = useWatch({
    control: form.control,
    name: 'compensationType',
  });
  const token = useWatch({
    control: form.control,
    name: 'token',
  });
  const eligibility = useWatch({
    control: form.control,
    name: 'eligibility',
  });

  // Form instance for preview purposes
  const previewForm = useForm({
    defaultValues: {
      eligibilityAnswers: (eligibility || []).map(() => ({
        answer: '',
      })),
      link: '',
      tweet: '',
      otherInfo: '',
      ask: null,
      token: '',
      otherTokenDetails: '',
    },
  });

  const hasEligibilityQsErrors = useMemo(() => {
    const errors = form.formState.errors;
    return (
      errors.eligibility &&
      errors?.eligibility?.some?.((question) => !!question)
    );
  }, [form]);

  const subtext = useMemo(
    () =>
      type === 'project' || type === 'sponsorship' ? (
        <>
          Applicant&apos;s <strong>Names</strong>, <strong>Email</strong>,{' '}
          <strong>IDs</strong>, and <strong>NEAR Wallet</strong> are collected
          by default. Please use this space to ask about anything else!
        </>
      ) : (
        <>
          The main {type === 'bounty' ? 'bounty' : 'hackathon'} submission link,
          the submitter&apos;s <strong>Names</strong>, <strong>Email</strong>,{' '}
          <strong>IDs</strong>, and <strong>NEAR Wallet</strong> are collected
          by default. Please use this space to ask about anything else!
        </>
      ),
    [type],
  );

  return (
    <Sheet
      open={open}
      onOpenChange={async (e) => {
        setOpen(e);
        form.saveDraft();
      }}
    >
      <SheetTrigger className="w-full">
        <FormField
          control={form.control}
          name={`eligibility`}
          render={({ field }) => (
            <FormItem className="items-start gap-1.5 pt-2">
              <div className="flex items-center gap-2">
                <FormLabel isRequired={type !== 'bounty'} className="">
                  Application Form
                </FormLabel>
                <Tooltip
                  delayDuration={100}
                  content={<p className="max-w-sm">{subtext}</p>}
                >
                  <Info className="h-3 w-3 text-slate-400" />
                </Tooltip>
              </div>
              <div className="flex w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-50 py-0.5 pl-2">
                <FilePen className="size-4 stroke-[1.5] text-slate-900" />
                <span className="flex items-center">
                  <p className="text-sm font-medium">
                    {field.value?.length || 0}
                  </p>
                  <p className="pl-1 text-sm">
                    Question{(field.value?.length || 0) === 1 ? '' : 's'}
                  </p>
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="ml-auto group-hover:underline"
                >
                  Edit
                </Button>
              </div>
              {hasEligibilityQsErrors ? (
                <p className={'text-[0.8rem] font-medium text-destructive'}>
                  Please resolve all errors in custom questions
                </p>
              ) : (
                <FormMessage />
              )}
            </FormItem>
          )}
        />
      </SheetTrigger>
      <SheetContent
        onInteractOutside={(e) => {
          const isToastItem = (e.target as Element)?.closest(
            '[data-sonner-toaster]',
          );
          if (isToastItem) e.preventDefault();
        }}
        showCloseIcon={false}
        side="right"
        className="flex h-[100vh] flex-col overflow-y-auto p-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 sm:max-w-2xl"
      >
        <SheetHeader className="space-y-2 p-6 pb-0">
          <SheetTitle>Application Form</SheetTitle>
          <SheetDescription className="text-sm text-slate-500">
            {subtext}
          </SheetDescription>
        </SheetHeader>

        <div id="main-content" className="flex flex-col">
          <Tabs defaultValue="builder" className="mb-0">
            <TabsList
              className={cn(
                'relative mb-4 w-full justify-start gap-4 px-6',
                'before:absolute before:bottom-[-2px] before:left-1 before:right-0 before:h-[1px] before:w-full before:bg-slate-200',
              )}
            >
              <TabsTrigger
                value="builder"
                className={cn(
                  'data-[state=active]:bg-transparent data-[state=hover]:bg-gray-900 data-[state=active]:text-slate-500 after:data-[state=active]:h-[1px] hover:text-slate-500',
                  'hover:after:absolute hover:after:bottom-[-6px] hover:after:left-0 hover:after:h-[1px] hover:after:w-full hover:after:bg-gray-900',
                )}
              >
                Form Builder
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className={cn(
                  'data-[state=active]:bg-transparent data-[state=hover]:bg-gray-900 data-[state=active]:text-slate-500 after:data-[state=active]:h-[1px] after:data-[state=active]:bg-gray-900 hover:text-slate-500',
                  'hover:after:absolute hover:after:bottom-[-6px] hover:after:left-0 hover:after:h-[1px] hover:after:w-full hover:after:bg-gray-900',
                )}
              >
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="builder" className="flex w-full flex-col gap-4">
              <div className="flex w-[calc(100%-28px)] flex-col gap-4 px-6">
                <SubmissionLimit />
                <DefaultEligibilityQuestions />
              </div>
              <Separator />
              <div className="w-[calc(100%-28px)] px-6">
                <EligibilityQuestionsForm />
              </div>
            </TabsContent>
            <TabsContent value="preview" className="mt-0 flex flex-col px-6">
              <EligibilityQuestionsPreview
                questions={eligibility}
                control={previewForm.control as any}
                listingId={''}
                editFetched={false}
                compensationType={compensationType}
                token={token}
                listingType={type}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="sticky bottom-0 z-50 mt-auto bg-white">
          <Separator className="mb-4" />
          <SheetFooter className="p-6 pt-0">
            <Button
              type="submit"
              className="w-full"
              onClick={async () => {
                if (await form.validateEligibilityQuestions()) {
                  setOpen(false);
                } else {
                  toast.warning(
                    'Please resolve all errors in Custom Questions to Continue',
                    { position: 'top-right' },
                  );
                }
              }}
            >
              Continue
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
