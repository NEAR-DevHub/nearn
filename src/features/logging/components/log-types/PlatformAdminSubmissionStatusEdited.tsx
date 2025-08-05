import { cn } from '@/utils/cn';

import {
  type EventData,
  type EventType,
  type PlatformAdminEditableSubmissionFields,
} from '@/features/logging/types/event-data';
import { colorMap } from '@/features/sponsor-dashboard/utils/statusColorMap';

import type { LogProperties } from './index';

function formatFieldName(field: PlatformAdminEditableSubmissionFields): string {
  const fieldNames: Record<PlatformAdminEditableSubmissionFields, string> = {
    status: 'submission status',
    paymentDetails: 'payment details',
  };
  return fieldNames[field] || field;
}

function formatValue(
  field: PlatformAdminEditableSubmissionFields,
  value: any,
): React.ReactNode {
  if (value === null || value === undefined) {
    return 'empty';
  }

  switch (field) {
    case 'status':
      const style = colorMap[value as keyof typeof colorMap];
      return (
        <span
          className={cn(
            'ml-1 inline-flex rounded-full px-3 py-0.5 text-center text-sm font-medium',
            style.bg,
            style.color,
          )}
        >
          {value}
        </span>
      );

    case 'paymentDetails':
      if (typeof value === 'object' && value.link) {
        return 'payment link added';
      }
      return 'payment details updated';

    default:
      return value.toString();
  }
}

function renderFieldChange(
  field: PlatformAdminEditableSubmissionFields,
  oldValue: any,
  newValue: any,
): React.ReactNode {
  const formattedOld = formatValue(field, oldValue);
  const formattedNew = formatValue(field, newValue);

  // Handle empty/null cases
  const wasEmpty = oldValue === null || oldValue === undefined;
  const isNowEmpty = newValue === null || newValue === undefined;

  switch (field) {
    case 'status':
      return (
        <span className="text-slate-500">
          Changed submission status from {formattedOld} to {formattedNew}
        </span>
      );

    case 'paymentDetails':
      if (wasEmpty && !isNowEmpty) {
        return <span className="text-slate-500">Added payment details</span>;
      } else if (!wasEmpty && isNowEmpty) {
        return <span className="text-slate-500">Removed payment details</span>;
      } else {
        return <span className="text-slate-500">Updated payment details</span>;
      }

    default:
      return (
        <span className="text-slate-500">
          Changed {formatFieldName(field)} from {formattedOld} to{' '}
          <span className="font-medium">{formattedNew}</span>
        </span>
      );
  }
}

export default function PlatformAdminSubmissionStatusEdited({
  event,
}: LogProperties) {
  const data =
    event.data as EventData<EventType.PLATFORM_ADMIN_SUBMISSION_STATUS_EDITED>;

  if (!data.changes || data.changes.length === 0) {
    return <p className="text-slate-500">Edited submission</p>;
  }

  const changeElements: React.ReactNode[] = data.changes.map(
    (change, index) => (
      <div key={index}>
        {renderFieldChange(change.field, change.oldValue, change.newValue)}
      </div>
    ),
  );

  if (changeElements.length === 0) {
    return <p className="text-slate-500">Edited submission</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {changeElements.map((element, index) => (
        <div key={index}>{element}</div>
      ))}
    </div>
  );
}
