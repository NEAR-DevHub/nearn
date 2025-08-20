import {
  type EventData,
  type EventType,
} from '@/features/logging/types/event-data';

import type { LogProperties } from '.';
import { renderSimpleFieldChange } from './utils';

function formatFieldName(field: string): string {
  const fieldNames: Record<string, string> = {
    amount: 'amount on manual payment',
    token: 'currency on manual payment',
    paymentDate: 'payment date',
    notes: 'payment notes',
    isPublic: 'notes visibility',
  };
  return fieldNames[field] || field;
}

function formatValue(field: string, value: any): string | React.ReactNode {
  if (value === null || value === undefined) {
    return 'empty';
  }

  if (field === 'amount') {
    return value.toString();
  }

  if (field === 'paymentDate') {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (field === 'isPublic') {
    return value ? 'public' : 'private';
  }

  return value.toString();
}

function renderFieldChange(
  field: string,
  oldValue: any,
  newValue: any,
): React.ReactNode {
  const formattedOld = formatValue(field, oldValue);
  const formattedNew = formatValue(field, newValue);

  const wasEmpty =
    oldValue === null ||
    oldValue === undefined ||
    oldValue === '' ||
    oldValue === 0;
  const isNowEmpty =
    newValue === null ||
    newValue === undefined ||
    newValue === '' ||
    newValue === 0;

  const fieldDisplayName = formatFieldName(field);

  if (field === 'isPublic') {
    if (newValue === true && oldValue === false) {
      return <span className="text-slate-500">Mark notes as public</span>;
    } else if (newValue === false && oldValue === true) {
      return <span className="text-slate-500">Mark notes as private</span>;
    }
  }

  if (field === 'paymentDate') {
    return (
      <span className="text-slate-500">
        Edited payment date from <span>{formattedOld}</span> to{' '}
        <span className="font-medium">{formattedNew}</span>
      </span>
    );
  }

  if (field === 'amount' || field === 'token') {
    return (
      <span className="text-slate-500">
        The {fieldDisplayName} was changed from <span>{formattedOld}</span> to{' '}
        <span className="font-medium">{formattedNew}</span>
      </span>
    );
  }

  return renderSimpleFieldChange(
    wasEmpty,
    isNowEmpty,
    fieldDisplayName,
    formattedNew,
    formattedOld,
  );
}

export default function SubmissionManualPaymentUpdated({
  event,
}: LogProperties) {
  const data =
    event.data as EventData<EventType.SUBMISSION_MANUAL_PAYMENT_UPDATED>;
  if (!data.changes || data.changes.length === 0) {
    return <p className="text-slate-500">Updated manual payment</p>;
  }

  const changeElements: React.ReactNode[] = data.changes.map((change) =>
    renderFieldChange(change.field, change.oldValue, change.newValue),
  );

  if (changeElements.length === 1) {
    return <>{changeElements[0]}</>;
  }

  return (
    <div className="flex flex-col gap-1">
      {changeElements.map((element, index) => (
        <div key={index}>{element}</div>
      ))}
    </div>
  );
}
