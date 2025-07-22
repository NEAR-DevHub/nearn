import { tokenList } from '@/constants/tokenList';

import {
  type EventData,
  type EventType,
} from '@/features/logging/types/event-data';

import type { LogProperties } from './index';
import { renderSimpleFieldChange } from './utils';

interface EligibilityAnswer {
  question: string;
  answer: string;
}

function formatFieldName(field: string): string {
  const fieldNames: Record<string, string> = {
    link: 'submission link',
    tweet: 'tweet link',
    otherInfo: 'additional info',
    eligibilityAnswers: 'custom questions',
    ask: 'requested amount',
    token: 'payment token',
    otherTokenDetails: 'token details',
  };
  return fieldNames[field] || field;
}

function formatValue(field: string, value: any): string | React.ReactNode {
  if (value === null || value === undefined) {
    return 'empty';
  }

  if (field === 'ask') {
    return value.toString();
  }

  if (field === 'token') {
    const tokenObject = tokenList.find((t) => t.tokenSymbol === value);
    if (tokenObject) {
      return (
        <span className="inline-flex items-center gap-1">
          <img
            src={tokenObject.icon}
            alt={tokenObject.tokenSymbol}
            className="h-4 w-4 rounded-full"
          />
          <span>{value}</span>
        </span>
      );
    }
    return value;
  }

  if (field === 'eligibilityAnswers') {
    const answers = value as EligibilityAnswer[];
    if (!Array.isArray(answers) || answers.length === 0) {
      return 'no answers';
    }
    return `${answers.length} answer${answers.length > 1 ? 's' : ''}`;
  }

  return `"${value}"`;
}

function renderEligibilityChanges(
  oldAnswers: EligibilityAnswer[] | null,
  newAnswers: EligibilityAnswer[] | null,
): React.ReactNode[] {
  const changes: React.ReactNode[] = [];
  const oldMap = new Map<string, string>();
  const newMap = new Map<string, string>();

  if (oldAnswers && Array.isArray(oldAnswers)) {
    oldAnswers.forEach((item) => {
      if (item.question) oldMap.set(item.question, item.answer || '');
    });
  }

  if (newAnswers && Array.isArray(newAnswers)) {
    newAnswers.forEach((item) => {
      if (item.question) newMap.set(item.question, item.answer || '');
    });
  }

  // Check for removed questions
  oldMap.forEach((_, question) => {
    if (!newMap.has(question)) {
      changes.push(
        <span key={`removed-${question}`} className="text-slate-500">
          Removed answer to &quot;
          <span className="font-medium">{question}</span>&quot;
        </span>,
      );
    }
  });

  // Check for added or edited questions
  newMap.forEach((newAnswer, question) => {
    const oldAnswer = oldMap.get(question);
    if (oldAnswer === undefined) {
      changes.push(
        <span key={`added-${question}`} className="text-slate-500">
          Answered &quot;<span className="font-medium">{question}</span>&quot;
        </span>,
      );
    } else if (oldAnswer !== newAnswer) {
      changes.push(
        <span key={`edited-${question}`} className="text-slate-500">
          Updated answer to &quot;
          <span className="font-medium">{question}</span>&quot;
        </span>,
      );
    }
  });

  return changes;
}

function renderFieldChange(
  field: string,
  oldValue: any,
  newValue: any,
): React.ReactNode {
  const formattedOld = formatValue(field, oldValue);
  const formattedNew = formatValue(field, newValue);

  // Handle empty/null cases
  const wasEmpty =
    oldValue === null || oldValue === undefined || oldValue === '';
  const isNowEmpty =
    newValue === null || newValue === undefined || newValue === '';

  switch (field) {
    case 'link':
    case 'tweet':
      const fieldDisplayName = formatFieldName(field);
      return renderSimpleFieldChange(
        wasEmpty,
        isNowEmpty,
        fieldDisplayName,
        formattedNew,
        formattedOld,
      );

    case 'ask':
      return (
        <span className="text-slate-500">
          Changed requested amount from {formattedOld} to{' '}
          <span className="font-medium">{formattedNew}</span>
        </span>
      );

    case 'token':
      return (
        <span className="inline-flex flex-wrap items-center gap-1 text-slate-500">
          Switched payment token from {formattedOld} to{' '}
          <span className="font-medium">{formattedNew}</span>
        </span>
      );

    case 'otherInfo':
      return renderSimpleFieldChange(
        wasEmpty,
        isNowEmpty,
        'additional information',
        formattedNew,
        undefined,
        { includeValue: false },
      );

    case 'otherTokenDetails':
      const tokenDetailsName = formatFieldName(field);
      return renderSimpleFieldChange(
        wasEmpty,
        isNowEmpty,
        tokenDetailsName,
        formattedNew,
        formattedOld,
      );

    default:
      return (
        <span className="text-slate-500">
          Changed {formatFieldName(field)} from {formattedOld} to{' '}
          <span className="font-medium">{formattedNew}</span>
        </span>
      );
  }
}

export default function SubmissionEdit({ event }: LogProperties) {
  const data = event.data as EventData<EventType.SUBMISSION_EDITED>;

  if (!data.changes || data.changes.length === 0) {
    return <p className="text-slate-500">Edited submission</p>;
  }

  const changeElements: React.ReactNode[] = [];

  data.changes.forEach((change, index) => {
    if (change.field === 'eligibilityAnswers') {
      const eligibilityChanges = renderEligibilityChanges(
        change.oldValue as EligibilityAnswer[] | null,
        change.newValue as EligibilityAnswer[] | null,
      );
      changeElements.push(...eligibilityChanges);
    } else {
      changeElements.push(
        <div key={index}>
          {renderFieldChange(change.field, change.oldValue, change.newValue)}
        </div>,
      );
    }
  });

  if (changeElements.length === 0) {
    return <p className="text-slate-500">Edited submission</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {changeElements.map((element, index) => (
        <p key={index}>{element}</p>
      ))}
    </div>
  );
}
