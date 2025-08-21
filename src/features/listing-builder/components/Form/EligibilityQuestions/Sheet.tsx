import { FilePen, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { EligibilityQuestionsForm as EligibilityQuestionsPreview } from '@/components/eligibility/EligibilityQuestions';
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
import { cn } from '@/utils/cn';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

import { useListingForm } from '@/features/listing-builder/hooks';

import { EligibilityQuestionsForm } from './QuestionsForm';
import { useAtomValue } from 'jotai';
import { isEditingAtom } from '@/features/listing-builder/atoms';

function SubmissionLimit() {
  const form = useListingForm();
  const type = useWatch({
    control: form.control,
    name: 'type',
  });
  const submissionLimit = useWatch({
    control: form.control,
    name: 'submissionLimit',
  });
  const isUpdating = useAtomValue(isEditingAtom);

  const isSponorship = type === 'sponsorship';
  const effectiveSubmissionLimit = submissionLimit || 'single';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="">
          <div className="flex items-center gap-1">
            <p className="text-sm font-medium text-slate-600">Submission Limit</p>
          </div>
          <p className="text-xs text-slate-500">
            Set how many times a contributor can submit during<br />the listing period
          </p>
        </div>
        <FormField
          control={form.control}
          name="submissionLimit"
          render={({ field }) => (
            <FormItem className="w-fit">
              <Select
                disabled={isUpdating}
                value={effectiveSubmissionLimit}
                onValueChange={(value) => {
                  field.onChange(value);
                  // Reset multipleSubmissionRule when changing to single
                  if (value === 'single') {
                    form.setValue('multipleSubmissionRule', null);
                  }
                }}
              >
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Select a limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="w-52" value="single">
                    Only one submission
                  </SelectItem>
                  <SelectItem className="w-52" value="multiple">
                    Multiple submissions
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {effectiveSubmissionLimit === 'multiple' && (
        <div className="space-y-3">
          <div>
            <p className="font-medium text-sm text-slate-600">Multiple Submission Rules</p>
            <p className="text-xs text-slate-500">
              When multiple submissions are allowed, decide when participants can submit again
            </p>
          </div>

          <FormField
            control={form.control}
            name="multipleSubmissionRule"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <RadioGroup
                  value={field.value || (isSponorship ? 'afterReview' : 'immediately')}
                  onValueChange={field.onChange}
                  disabled={isUpdating}
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="immediately" id="immediately" />
                    <div className="grid leading-none">
                      <Label
                        htmlFor="immediately"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Immediately
                      </Label>
                      <p className="text-xs text-slate-500">
                        Contributors can submit again without waiting for approval or rejection
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="afterReview" id="afterReview" />
                    <div className="grid leading-none">
                      <Label
                        htmlFor="afterReview"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        After review
                      </Label>
                      <p className="text-xs text-slate-500">
                        Contributors can only submit another entry once their previous one is approved or rejected
                      </p>
                    </div>
                  </div>
                </RadioGroup>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
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
  const sponsorId = useWatch({
    control: form.control,
    name: 'sponsorId',
  });
  const [activeTab, setActiveTab] = useState<
    'builder' | 'settings' | 'preview'
  >('builder');

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
      publicKey: '',
    },
  });

  const hasEligibilityQsErrors = useMemo(() => {
    const errors = form.formState.errors;
    return (
      errors.eligibility &&
      errors?.eligibility?.some?.((question) => !!question)
    );
  }, [form]);

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
        className="flex h-[100vh] flex-col overflow-y-auto p-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 sm:max-w-[694px]"
      >
        <SheetHeader className="space-y-2 p-6 pb-0">
          <SheetTitle>Application Form</SheetTitle>
          <SheetDescription className="text-sm text-slate-500">
            Customize the form applicants fill out when applying to your
            listing.
          </SheetDescription>
        </SheetHeader>

        <div id="main-content" className="flex flex-col px-6">
          <Tabs
            value={activeTab}
            onValueChange={(tab) => {
              setActiveTab(tab as 'builder' | 'settings' | 'preview');
            }}
            className="mb-0"
          >
            <TabsList
              className={cn(
                'relative mb-4 w-full justify-start gap-4',
                'before:absolute before:bottom-[-2px] before:left-1 before:right-0 before:h-[1px] before:w-full before:bg-slate-200',
              )}
            >
              <TabsTrigger
                value="builder"
                className={cn(
                  'data-[state=active]:bg-transparent data-[state=hover]:bg-brand-green-50 data-[state=active]:text-slate-500 after:data-[state=active]:h-[2px] after:data-[state=active]:bg-brand-green-50 hover:text-slate-500',
                  'hover:after:absolute hover:after:bottom-[-6px] hover:after:left-0 hover:after:h-[2px] hover:after:w-full hover:after:bg-brand-green-50',
                )}
              >
                Edit
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className={cn(
                  'data-[state=active]:bg-transparent data-[state=hover]:bg-brand-green-50 data-[state=active]:text-slate-500 after:data-[state=active]:h-[2px] after:data-[state=active]:bg-brand-green-50 hover:text-slate-500',
                  'hover:after:absolute hover:after:bottom-[-6px] hover:after:left-0 hover:after:h-[2px] hover:after:w-full hover:after:bg-brand-green-50',
                )}
              >
                Preview
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className={cn(
                  'data-[state=active]:bg-transparent data-[state=hover]:bg-brand-green-50 data-[state=active]:text-slate-500 after:data-[state=active]:h-[2px] after:data-[state=active]:bg-brand-green-50 hover:text-slate-500',
                  'hover:after:absolute hover:after:bottom-[-6px] hover:after:left-0 hover:after:h-[2px] hover:after:w-full hover:after:bg-brand-green-50',
                )}
              >
                Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="builder" className="flex w-full flex-col gap-6">
              <div className="flex items-center gap-[10px] rounded-lg bg-sky-50 p-4 text-sky-700">
                <Info className="h-4 w-4 shrink-0" />
                <div className="text-sm">
                  <span className="font-medium">Name</span>,{' '}
                  <span className="font-medium">Email</span>,{' '}
                  <span className="font-medium">NEAR Wallet</span>, and other
                  key details are collected automatically.
                  <br />
                  Use the{' '}
                  <Button
                    variant="link"
                    onClick={() => setActiveTab('preview')}
                    className="h-fit w-fit bg-sky-50 p-0 font-normal text-sky-700 underline underline-offset-2"
                  >
                    {' '}
                    Preview tab
                  </Button>{' '}
                  to see the full applicant view
                </div>
              </div>

              <div className="w-[calc(100%-28px)]">
                <EligibilityQuestionsForm />
              </div>
            </TabsContent>
            <TabsContent value="preview" className="mt-0 flex flex-col gap-4">
              <p className="text-sm font-medium text-slate-600">
                Preview the form as it will appear to applicants 👇
              </p>
              <EligibilityQuestionsPreview
                questions={eligibility}
                control={previewForm.control as any}
                sponsorId={sponsorId ?? null}
                listingId={''}
                editFetched={false}
                compensationType={compensationType}
                token={token}
                listingType={type}
                isGodMode={false}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-0 flex flex-col gap-4">
              <SubmissionLimit />
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
