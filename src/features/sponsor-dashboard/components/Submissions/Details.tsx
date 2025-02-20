import { useAtomValue } from 'jotai';
import React from 'react';

import { getURLSanitized } from '@/utils/getURLSanitized';

import { type Listing } from '@/features/listings/types';

import { selectedSubmissionAtom } from '../../atoms';
import { InfoBox } from '../InfoBox';
import { Notes } from './Notes';
import { cn } from '@/utils/cn';

interface Props {
  bounty: Listing | undefined;
  modalView?: boolean;
}

export const Details = ({ bounty,  modalView }: Props) => {
  const selectedSubmission = useAtomValue(selectedSubmissionAtom);
  const isProject = bounty?.type === 'project';

  return (
    <div
      className={cn(
        'flex w-full',
        modalView ? 'h-[24rem] mx-auto max-w-3xl px-4' : 'h-[32.6rem] border-r border-slate-200',
      )}
    >
      <div className="scrollbar-thumb-rounded-full flex w-full flex-1 flex-col overflow-y-auto p-4 scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300">
        {!isProject && (
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
        {bounty?.compensationType !== 'fixed' && (
          <InfoBox
            label="Ask"
            content={`${selectedSubmission?.ask?.toLocaleString('en-us')} ${bounty?.token}`}
          />
        )}

        {selectedSubmission?.eligibilityAnswers &&
          selectedSubmission.eligibilityAnswers.map((answer: any) => (
            <InfoBox
              key={answer.question}
              label={answer.question}
              content={answer.answer}
              isHtml
            />
          ))}
        <InfoBox
          label="Anything Else"
          content={selectedSubmission?.otherInfo}
          isHtml
        />
      </div>
      {!modalView && (
        <div className="w-1/4 p-4">
          {selectedSubmission && (
            <Notes
              key={selectedSubmission.id}
              submissionId={selectedSubmission.id}
              initialNotes={selectedSubmission.notes}
              slug={bounty?.slug}
            />
          )}
        </div>
      )}
    </div>
  );
};
