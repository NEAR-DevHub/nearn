import { Baseline, Link2 } from 'lucide-react';
import { useWatch } from 'react-hook-form';

import { Tooltip } from '@/components/ui/tooltip';

import { useListingForm } from '@/features/listing-builder/hooks';
import { Twitter } from '@/features/social/components/SocialIcons';

import { TokenLabel } from '../Rewards/Tokens/TokenLabel';

export function DefaultEligibilityQuestions() {
  const form = useListingForm();
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

  const TOOLTIP_CONTENT = `This is a default field for your ${type === 'project' ? 'Application' : 'Submission'} form. This question cannot be edited or removed.`;
  return (
    <div>
      <p className="pb-3 text-xs font-medium uppercase text-slate-500">
        COLLECTED BY DEFAULT
      </p>
      <div className="flex flex-col gap-4">
        {type !== 'project' && type !== 'sponsorship' && (
          <>
            <DefaultQuestionField
              TOOLTIP_CONTENT={TOOLTIP_CONTENT}
              icon={<Link2 className="h-4 w-4" />}
              label={
                type === 'bounty'
                  ? 'Bounty submission link'
                  : 'Hackathon submission link'
              }
              required
            />

            <DefaultQuestionField
              TOOLTIP_CONTENT={TOOLTIP_CONTENT}
              icon={
                <Twitter className="h-4 w-4 text-slate-400 opacity-100 grayscale-0" />
              }
              label="Twitter post"
            />
          </>
        )}
        {compensationType !== 'fixed' && (
          <DefaultQuestionField
            TOOLTIP_CONTENT={TOOLTIP_CONTENT}
            icon={
              <TokenLabel
                symbol={token}
                showIcon
                classNames={{
                  amount: 'font-medium text-base ml-0',
                  symbol: 'font-medium text-base mr-0',
                  icon: 'mr-0',
                }}
              />
            }
            label={`Compensation Quote${token === 'Any' ? ' in USD' : ''}`}
            required
          />
        )}
        {token === 'Any' && (
          <DefaultQuestionField
            TOOLTIP_CONTENT={TOOLTIP_CONTENT}
            required
            icon={
              <TokenLabel
                symbol={token}
                showIcon
                classNames={{
                  amount: 'font-medium text-base ml-0',
                  symbol: 'font-medium text-base mr-0',
                  icon: 'mr-0',
                }}
              />
            }
            label="Token to be paid in"
          />
        )}
        <DefaultQuestionField
          TOOLTIP_CONTENT={TOOLTIP_CONTENT}
          icon={<Baseline className="h-4 w-4 text-slate-400" />}
          label="Anything Else"
        />
      </div>
    </div>
  );
}

interface DefaultQuestionFieldProps {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  TOOLTIP_CONTENT: string;
}

export function DefaultQuestionField({
  icon,
  label,
  required = false,
  TOOLTIP_CONTENT,
}: DefaultQuestionFieldProps) {
  return (
    <Tooltip content={TOOLTIP_CONTENT}>
      <div className="flex h-9 w-[calc(100%-28px)] cursor-not-allowed items-center rounded-md border bg-slate-100 opacity-80">
        <span className="flex h-full items-center rounded-md border-r px-4 text-slate-400">
          {icon}
        </span>
        <p className="pl-4 text-sm text-slate-500">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </p>
      </div>
    </Tooltip>
  );
}
