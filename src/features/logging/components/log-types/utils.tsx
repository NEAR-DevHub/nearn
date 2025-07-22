import React from 'react';

export function renderSimpleFieldChange(
  wasEmpty: boolean,
  isNowEmpty: boolean,
  fieldName: string,
  formattedNew: string | React.ReactNode,
  formattedOld?: string | React.ReactNode,
  options?: {
    includeValue?: boolean;
    actionVerbs?: {
      added?: string;
      removed?: string;
      changed?: string;
      updated?: string;
    };
  },
): React.ReactNode {
  const includeValue = options?.includeValue ?? true;
  const verbs = {
    added: 'Added',
    removed: 'Removed',
    changed: 'Changed',
    updated: 'Updated',
    ...options?.actionVerbs,
  };

  if (wasEmpty && !isNowEmpty) {
    return (
      <span className="text-slate-500">
        {verbs.added} {fieldName}
        {includeValue && (
          <>
            : <span className="font-medium">{formattedNew}</span>
          </>
        )}
      </span>
    );
  }

  if (!wasEmpty && isNowEmpty) {
    return (
      <span className="text-slate-500">
        {verbs.removed} {fieldName}
      </span>
    );
  }

  // If formattedOld is provided, show "Changed X from Y to Z"
  if (formattedOld !== undefined) {
    return (
      <span className="text-slate-500">
        {verbs.changed} {fieldName} from {formattedOld} to{' '}
        <span className="font-medium">{formattedNew}</span>
      </span>
    );
  }

  // Otherwise show "Updated X to Z"
  return (
    <span className="text-slate-500">
      {verbs.updated} {fieldName}
      {includeValue && (
        <>
          {' '}
          to <span className="font-medium">{formattedNew}</span>
        </>
      )}
    </span>
  );
}
