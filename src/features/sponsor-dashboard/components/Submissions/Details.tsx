import dayjs from 'dayjs';
import { Info } from 'lucide-react';
import React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip } from '@/components/ui/tooltip';
import { type SubmissionWithUser } from '@/interface/submission';
import { cn } from '@/utils/cn';
import { getURLSanitized } from '@/utils/getURLSanitized';

import { DescriptionUI } from '@/features/listings/components/ListingPage/DescriptionUI';
import { type Listing } from '@/features/listings/types';

import { InfoBox, parseHtml } from '../InfoBox';
import SubmissionStatusExplanation from './SubmissionStatusExplainer';

interface Props {
  bounty: Listing | undefined;
  externalView?: boolean;
  selectedSubmission: SubmissionWithUser | undefined;
}

export const Details = ({
  bounty,
  externalView,
  selectedSubmission,
}: Props) => {
  const isProject = bounty?.type === 'project';
  const isSponsorship = bounty?.type === 'sponsorship';

  return (
    <div
      className={cn(
        'flex w-full',
        externalView ? 'h-full max-w-3xl' : 'min-h-0 flex-1 flex-col',
      )}
    >
      <div
        className={cn(
          'scrollbar-thumb-rounded-full flex w-full flex-1 flex-col scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300',
          externalView ? 'mt-3' : 'overflow-y-auto p-4',
        )}
      >
        <div className="mb-4">
          <SubmissionStatusExplanation submission={selectedSubmission} />
        </div>

        {selectedSubmission?.otherTokenDetails && (
          <InfoBox
            label="Payment Details"
            isHtml
            content={selectedSubmission?.otherTokenDetails}
          />
        )}

        <InfoBox
          label="Application Date"
          content={`${dayjs(selectedSubmission?.createdAt).format('DD MMM YYYY')}`}
        />

        {!isProject && !isSponsorship && (
          <>
            <InfoBox
              label="Main Submission"
              content={
                selectedSubmission?.link
                  ? getURLSanitized(selectedSubmission?.link)
                  : '-'
              }
            />
            <InfoBox
              label="Tweet Link"
              content={
                selectedSubmission?.tweet
                  ? getURLSanitized(selectedSubmission?.tweet)
                  : '-'
              }
            />
          </>
        )}
        {selectedSubmission?.eligibilityAnswers &&
          selectedSubmission.eligibilityAnswers.map(
            (answer: any, i: number) => {
              const description =
                selectedSubmission.listing?.eligibility?.[i]?.description;
              if (
                selectedSubmission.listing?.eligibility?.[i]?.type ===
                'checkbox'
              ) {
                return (
                  <div className="mb-4" key={answer.question}>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={answer.answer === 'true'}
                        className="cursor-not-allowed opacity-50"
                        disabled
                      />
                      <InfoBox
                        content={answer.question}
                        className="mb-0"
                        isHtml={true}
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div key={answer.question} className="mb-4">
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold uppercase text-slate-400">
                    {answer.question}
                    {description && (
                      <Tooltip
                        content={description}
                        contentProps={{
                          className: 'whitespace-pre-wrap text-wrap',
                        }}
                      >
                        <Info className="size-3 text-slate-300 hover:text-slate-400" />
                      </Tooltip>
                    )}
                  </p>
                  {selectedSubmission.listing?.eligibility?.[i]?.type ===
                  'paragraph' ? (
                    <DescriptionUI description={answer.answer} />
                  ) : (
                    <div
                      id="reset-des"
                      className={cn('h-full w-full overflow-visible')}
                    >
                      {parseHtml(answer.answer)}
                    </div>
                  )}
                </div>
              );
            },
          )}
        <InfoBox
          label="Anything Else"
          content={selectedSubmission?.otherInfo}
          isHtml
        />
      </div>
    </div>
  );
};
