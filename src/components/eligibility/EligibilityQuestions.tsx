import { type ClassValue } from 'clsx';
import { ArrowLeftIcon, Check, ChevronDown } from 'lucide-react';
import React, { type JSX } from 'react';
import { type Control, useWatch } from 'react-hook-form';

import { RichEditor } from '@/components/shared/RichEditor';
import { MinimalTiptapEditor } from '@/components/tiptap';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CHAIN_NAME } from '@/constants/project';
import { tokenList } from '@/constants/tokenList';
import { useUser } from '@/store/user';
import { cn } from '@/utils/cn';

import { type QuestionType } from '@/features/listing-builder/components/Form/EligibilityQuestions/Question/Type';
import { InfoBox } from '@/features/sponsor-dashboard/components/InfoBox';

import { FormFieldWrapper } from '../ui/form-field-wrapper';
import { KycComponent } from '../ui/KycComponent';

interface Question {
  order?: number;
  question: string;
  description?: string | null;
  optional?: boolean | null;
  variants?: string[] | null;
  type?: QuestionType;
  isLink?: boolean | null;
}

interface EligibilityQuestionsProps {
  questions: Question[] | null | undefined;
  control: Control<any>;
  sponsorId: string | null;
  listingId: string | number | null;
  editFetched: boolean;
  compensationType: string | null;
  token: string | null;
  listingType: string | null;
  isGodMode: boolean;
  showBack?: boolean;
  onBack?: () => void;
}

export function EligibilityQuestionsForm({
  questions,
  control,
  sponsorId,
  listingId,
  listingType,
  editFetched = false,
  compensationType,
  token,
  isGodMode,
  showBack = false,
  onBack = () => {},
}: EligibilityQuestionsProps) {
  const tokenSelected = useWatch({
    control,
    name: 'token' as any,
  }) as any;
  const formPublicKey = useWatch({
    control: control,
    name: 'publicKey',
  });
  const { user } = useUser();

  let headerText = '';
  let subheadingText: JSX.Element | string = '';
  switch (listingType) {
    case 'project':
      headerText = 'Submit Your Application';
      subheadingText = (
        <>
          Don&apos;t start working just yet! Apply first, and then begin working
          only once you&apos;ve been chosen for the project by the sponsor.
          <p>
            Please note that the sponsor might contact you to assess fit before
            picking the winner.
          </p>
        </>
      );
      break;
    case 'bounty':
      headerText = 'Bounty Submission';
      subheadingText = "We can't wait to see what you've created!";
      break;
    case 'sponsorship':
      headerText = 'Sponsorship Submission';
      subheadingText = "We can't wait to see what you've created!";
      break;
    case 'hackathon':
      headerText = `${CHAIN_NAME} Radar Track Submission`;
      subheadingText = (
        <>
          Note:
          <p>
            1. In the &quot;Link to your Submission&quot; field, submit your
            hackathon project&apos;s most useful link (could be a loom video,
            GitHub link, website, etc)
          </p>
          <p>
            2. To be eligible for different challenges, you need to submit to
            each challenge separately
          </p>
          <p>
            3. {`There's no`} restriction on the number of challenges you can
            submit to
          </p>
        </>
      );
      break;
  }

  return (
    <React.Fragment>
      <div className="h-full overflow-y-auto rounded-lg border border-slate-200 px-2 shadow-[0px_1px_3px_rgba(0,0,0,0.08),_0px_1px_2px_rgba(0,0,0,0.06)] md:px-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:w-1.5 [&::-webkit-scrollbar]:w-1">
        <div className="mb-4 border-b border-slate-100 bg-white py-3">
          <div className="flex flex-col">
            {showBack && (
              <Button
                variant="link"
                onClick={onBack}
                className="w-fit p-0 text-slate-500"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </Button>
            )}
            <p className="text-lg font-medium text-slate-700">
              {isGodMode ? '[GOD MODE] ' : ''}
              {headerText}
            </p>
          </div>
          <p className="text-sm text-slate-500">{subheadingText}</p>
        </div>
        <div>
          <div className="mb-5 flex flex-col gap-4">
            {listingType !== 'project' && listingType !== 'sponsorship' && (
              <>
                <FormField
                  control={control}
                  name={'link' as any}
                  render={({ field }) => (
                    <FormItem className={cn('flex flex-col gap-2')}>
                      <div>
                        <FormLabel isRequired>
                          Link to Your Submission
                        </FormLabel>
                        <FormDescription>
                          Make sure this link is accessible by everyone!
                        </FormDescription>
                      </div>
                      <div>
                        <FormControl>
                          <div className="flex">
                            <div className="flex items-center gap-1 rounded-l-md border border-r-0 border-input bg-muted px-2 shadow-sm">
                              <p className="text-sm font-medium text-slate-500">
                                https://
                              </p>
                            </div>
                            <Input
                              {...field}
                              maxLength={500}
                              placeholder="Add a link"
                              className="rounded-l-none"
                              autoComplete="off"
                            />
                          </div>
                        </FormControl>

                        <FormMessage className="pt-1" />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={'tweet' as any}
                  render={({ field }) => (
                    <FormItem className={cn('flex flex-col gap-2')}>
                      <div>
                        <FormLabel>Tweet Link</FormLabel>
                        <FormDescription>
                          This helps sponsors discover (and maybe repost) your
                          work on Twitter! If this submission is for a Twitter
                          thread bounty, you can ignore this field.
                        </FormDescription>
                      </div>
                      <div>
                        <FormControl>
                          <div className="flex">
                            <div className="flex items-center gap-1 rounded-l-md border border-r-0 border-input bg-muted px-2 shadow-sm">
                              <p className="text-sm font-medium text-slate-500">
                                https://
                              </p>
                            </div>
                            <Input
                              {...field}
                              maxLength={500}
                              placeholder="Add a tweet's link"
                              className="rounded-l-none"
                              autoComplete="off"
                            />
                          </div>
                        </FormControl>

                        <FormMessage className="pt-1" />
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}
            {questions &&
              questions.map((e, index) => {
                const fieldName = `eligibilityAnswers.${index}.answer` as const;

                if (e.type === 'checkbox') {
                  return (
                    <FormField
                      key={`${index}-${e.order}`}
                      control={control}
                      name={fieldName as any}
                      render={({ field }) => (
                        <FormItem className={cn('flex flex-col gap-1')}>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value === 'true'}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked ? 'true' : 'false');
                                }}
                              />
                            </FormControl>
                            <InfoBox
                              content={e.question}
                              className="mb-0"
                              contentClassName={cn(
                                '[&_p]:!text-[0.9rem] [&_a]:!text-[0.9rem] flex items-center',
                                e.optional !== true &&
                                  "after:content-['*'] after:text-red-500 after:ml-1",
                              )}
                              isHtml={true}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                }

                if (e.type === 'select') {
                  return (
                    <FormField
                      key={`${index}-${e.order}`}
                      control={control}
                      name={fieldName as any}
                      render={({ field }) => (
                        <FormItem className={cn('flex flex-col gap-2')}>
                          <div>
                            <FormLabel isRequired={e.optional !== true}>
                              {e.question}
                            </FormLabel>
                            {e.description && (
                              <FormDescription className="whitespace-pre-wrap text-wrap">
                                {e.description}
                              </FormDescription>
                            )}
                          </div>
                          <div>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an option..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {e.variants?.map((variant, variantIndex) => (
                                    <SelectItem
                                      key={variantIndex}
                                      value={variant}
                                    >
                                      {variant}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className="pt-1" />
                          </div>
                        </FormItem>
                      )}
                    />
                  );
                }

                return (
                  <FormField
                    key={`${index}-${e.order}`}
                    control={control}
                    name={fieldName as any}
                    render={({ field }) => (
                      <FormItem className={cn('flex flex-col gap-2')}>
                        <div>
                          <FormLabel isRequired={e.optional !== true}>
                            {e.question}
                          </FormLabel>
                          {e.description && (
                            <FormDescription className="whitespace-pre-wrap text-wrap">
                              {e.description}
                            </FormDescription>
                          )}
                        </div>
                        <div>
                          <FormControl>
                            {e.isLink || e.type === 'link' ? (
                              <div className="flex">
                                <div className="flex items-center gap-1 rounded-l-md border border-r-0 border-input bg-muted px-2 shadow-sm">
                                  <p className="text-sm font-medium text-slate-500">
                                    https://
                                  </p>
                                </div>
                                <Input
                                  {...field}
                                  placeholder="Add a link..."
                                  className="rounded-l-none"
                                  autoComplete="off"
                                />
                              </div>
                            ) : e.type === 'paragraph' ? (
                              <div className="flex rounded-md border shadow-sm ring-primary has-[:focus]:ring-1">
                                <MinimalTiptapEditor
                                  key={`${field.name}-${editFetched ? listingId : ''}`}
                                  {...field}
                                  value={field.value || ''}
                                  immediatelyRender={false}
                                  className="min-h-[30vh] w-full border-0 text-sm"
                                  editorContentClassName="p-4 px-2 h-full"
                                  output="html"
                                  placeholder="Type your description here..."
                                  editorClassName="focus:outline-none"
                                  imageSetting={{
                                    folderName: 'listing-eligibility-answer',
                                    type: 'custom-question',
                                  }}
                                  toolbarClassName="sticky top-0 rounded-t-md bg-white z-[75] w-full overflow-x-hidden"
                                />
                              </div>
                            ) : (
                              <RichEditor
                                {...field}
                                id={`eligibilityAnswers.${index}.answer`}
                                value={field.value || ''}
                                error={false}
                                placeholder={'Write something...'}
                              />
                            )}
                          </FormControl>
                          <FormMessage className="pt-1" />
                        </div>
                      </FormItem>
                    )}
                  />
                );
              })}
            {compensationType !== 'fixed' && (
              <FormFieldWrapper
                control={control}
                name={'ask' as any}
                label="Total Amount"
                description={
                  token !== 'Any'
                    ? "What's the compensation you require to complete this fully?"
                    : 'Enter the exact amount you are seeking in US dollars.'
                }
                isRequired
                isTokenInput
                token={token ?? undefined}
              />
            )}

            {token === 'Any' && <TokenSelect control={control} />}
            {token === 'Any' && tokenSelected === 'Other' && (
              <FormFieldWrapper
                control={control}
                name={'otherTokenDetails' as any}
                isRequired={tokenSelected === 'Other'}
                label="Payment details"
                isRichEditor
                description="What's your preferred way to receive a payment ?"
                richEditorPlaceholder="I want to receive a payment in..."
              />
            )}

            <FormFieldWrapper
              control={control}
              name={'otherInfo' as any}
              label="Anything Else?"
              description="If you have any other links or information you'd like to share with us, please add them here!"
              isRichEditor
              richEditorPlaceholder="Add info or link"
            />
            <FormField
              control={control}
              name="publicKey"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col gap-2">
                  <div>
                    <FormLabel isRequired={!user?.publicKey}>
                      Your {CHAIN_NAME} Wallet Address
                    </FormLabel>
                    <FormDescription>
                      {!!user?.publicKey ? (
                        <>
                          This is where you will receive your payment if your
                          submission is approved. If you want to edit it,{' '}
                          <a
                            href={`/t/${user?.username}/edit`}
                            className="text-blue-600 underline hover:text-blue-700"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            click here
                          </a>
                        </>
                      ) : (
                        <>
                          This wallet address will be linked to your profile and
                          you will receive your rewards here if you win.
                        </>
                      )}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <Input
                        className={cn(
                          !!user?.publicKey &&
                            'cursor-not-allowed text-slate-600 opacity-80',
                        )}
                        placeholder={`Add your ${CHAIN_NAME} wallet address`}
                        readOnly={!!user?.publicKey}
                        {...(!!user?.publicKey ? {} : field)}
                        value={user?.publicKey || field.value}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <KycComponent
              address={formPublicKey ?? user?.publicKey ?? ''}
              listingSponsorId={sponsorId as string}
              variant="extended"
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

interface TokenSelectProps {
  control: Control<any>;
  name?: string;
  hideDescription?: boolean;
}

export function TokenSelect({
  control,
  name,
  hideDescription = false,
}: TokenSelectProps) {
  return (
    <FormField
      name={name ?? ('token' as any)}
      control={control}
      render={({ field }) => (
        <FormItem className="gap-2">
          <div>
            <FormLabel isRequired>Currency</FormLabel>
            {!hideDescription && (
              <FormDescription>
                Select your preferred currency for receiving funds. The exchange
                rate will be the closing rate at the day of the invoice.
              </FormDescription>
            )}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between',
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  {field.value ? (
                    <TokenLabel
                      control={control}
                      showIcon
                      showSymbol
                      classNames={{
                        symbol: 'text-slate-900',
                        postfix: 'text-slate-900',
                      }}
                    />
                  ) : (
                    'Select Token'
                  )}
                  <ChevronDown className="opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent
              style={{ width: 'var(--radix-popover-trigger-width)' }}
              className="p-0"
            >
              <Command>
                <CommandInput placeholder="Search token..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No Token found.</CommandEmpty>
                  <CommandGroup>
                    {tokenList
                      .filter((token) => token.tokenSymbol !== 'Any')
                      .map((token) => (
                        <CommandItem
                          value={token.tokenName}
                          key={token.tokenSymbol}
                          onSelect={() => {
                            field.onChange(token.tokenSymbol);
                          }}
                        >
                          <TokenLabel
                            control={control}
                            token={token}
                            showIcon
                            showName
                          />
                          <Check
                            className={cn(
                              'ml-auto',
                              token.tokenSymbol === (field.value as string)
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface TokenLabelProps {
  symbol?: string;
  className?: ClassValue;
  showIcon?: boolean;
  showSymbol?: boolean;
  showName?: boolean;
  postfix?: string;
  amount?: number | null;
  token?: (typeof tokenList)[0];
  classNames?: {
    icon?: ClassValue;
    symbol?: ClassValue;
    amount?: ClassValue;
    postfix?: ClassValue;
    name?: ClassValue;
  };
  control: Control<any>;
  formatter?: (amount: number) => string;
}

const defaultFormatter = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);

export function TokenLabel({
  symbol,
  className,
  showIcon = true,
  showSymbol = false,
  showName = false,
  postfix,
  amount,
  classNames,
  token: preToken,
  formatter = defaultFormatter,
  control,
}: TokenLabelProps) {
  const formToken = useWatch({
    control: control,
    name: 'token' as any,
  }) as any;

  const searchSymbol = symbol || formToken;
  const token =
    preToken || tokenList.find((token) => token.tokenSymbol === searchSymbol);

  if (!token) return null;
  return (
    <span className={cn('flex w-max items-center', className)}>
      {showIcon && (
        <img
          src={token.icon}
          alt={token.tokenSymbol}
          className={cn('mr-1 block h-4 w-4 rounded-full', classNames?.icon)}
        />
      )}
      {typeof amount === 'number' && !isNaN(amount) && (
        <span className={cn('ml-2 text-sm', classNames?.amount)}>
          {formatter(amount)}
        </span>
      )}
      {showName && (
        <span className={cn('ml-2 text-sm', classNames?.symbol)}>
          {token.tokenName}
        </span>
      )}
      {showSymbol && (
        <span className={cn('ml-2 text-sm', classNames?.symbol)}>
          {token.tokenSymbol}
        </span>
      )}
      {postfix && (
        <span className={cn('ml-1 text-sm', classNames?.postfix)}>
          {postfix}
        </span>
      )}
    </span>
  );
}
