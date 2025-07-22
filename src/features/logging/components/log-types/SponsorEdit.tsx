import {
  type EventData,
  type EventType,
} from '@/features/logging/types/event-data';

import type { LogProperties } from './index';
import { renderSimpleFieldChange } from './utils';

function formatFieldName(field: string): string {
  const fieldNames: Record<string, string> = {
    name: 'sponsor name',
    slug: 'username',
    bio: 'bio',
    logo: 'logo',
    banner: 'banner image',
    industry: 'industry',
    website: 'website',
    twitter: 'X (Twitter)',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    telegram: 'Telegram',
    discord: 'Discord',
    entityName: 'entity name',
    about: 'about section',
  };
  return fieldNames[field] || field;
}

function formatValue(field: string, value: any): string {
  if (value === null || value === undefined || value === '') {
    return 'empty';
  }

  // For URLs, just show the domain or handle
  if (
    [
      'website',
      'twitter',
      'linkedin',
      'github',
      'telegram',
      'discord',
    ].includes(field)
  ) {
    if (field === 'twitter' && value.includes('twitter.com/')) {
      return `@${value.split('twitter.com/')[1]}`;
    }
    if (field === 'twitter' && value.includes('x.com/')) {
      return `@${value.split('x.com/')[1]}`;
    }
    if (field === 'linkedin' && value.includes('linkedin.com/')) {
      return value.split('linkedin.com/')[1];
    }
    if (field === 'github' && value.includes('github.com/')) {
      return value.split('github.com/')[1];
    }
    if (field === 'website') {
      try {
        const url = new URL(value);
        return url.hostname.replace('www.', '');
      } catch {
        return value;
      }
    }
    return value;
  }

  return value.toString();
}

function renderIndustryChanges(
  oldIndustry: string | string[] | null,
  newIndustry: string | string[] | null,
): React.ReactNode {
  // Convert to arrays for consistent handling
  const oldIndustries = new Set<string>();
  const newIndustries = new Set<string>();

  if (oldIndustry) {
    if (typeof oldIndustry === 'string') {
      // Handle comma-separated string
      oldIndustry.split(',').forEach((ind) => {
        const trimmed = ind.trim();
        if (trimmed) oldIndustries.add(trimmed);
      });
    } else if (Array.isArray(oldIndustry)) {
      oldIndustry.forEach((ind) => {
        if (ind) oldIndustries.add(ind);
      });
    }
  }

  if (newIndustry) {
    if (typeof newIndustry === 'string') {
      // Handle comma-separated string
      newIndustry.split(',').forEach((ind) => {
        const trimmed = ind.trim();
        if (trimmed) newIndustries.add(trimmed);
      });
    } else if (Array.isArray(newIndustry)) {
      newIndustry.forEach((ind) => {
        if (ind) newIndustries.add(ind);
      });
    }
  }

  const removed = Array.from(oldIndustries).filter(
    (ind) => !newIndustries.has(ind),
  );
  const added = Array.from(newIndustries).filter(
    (ind) => !oldIndustries.has(ind),
  );

  if (removed.length === 0 && added.length === 0) {
    return null;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-slate-500">
      Updated industry:{' '}
      {removed.length > 0 && (
        <>
          removed{' '}
          {removed.map((industry, idx) => (
            <span key={`removed-${idx}`}>
              <span className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
                {industry}
              </span>
            </span>
          ))}
        </>
      )}
      {removed.length > 0 && added.length > 0 && ', '}
      {added.length > 0 && (
        <>
          added{' '}
          {added.map((industry, idx) => (
            <span key={`added-${idx}`}>
              <span className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
                {industry}
              </span>
            </span>
          ))}
        </>
      )}
    </span>
  );
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
    case 'name':
      return (
        <span className="text-slate-500">
          Renamed sponsor from &quot;
          <span className="font-medium">{formattedOld}</span>
          &quot; to &quot;<span className="font-medium">{formattedNew}</span>
          &quot;
        </span>
      );

    case 'entityName':
      if (wasEmpty && !isNowEmpty) {
        return (
          <span className="text-slate-500">
            Added entity name:{' '}
            <span className="font-medium">&quot;{formattedNew}&quot;</span>
          </span>
        );
      }
      if (!wasEmpty && isNowEmpty) {
        return <span className="text-slate-500">Removed entity name</span>;
      }
      return (
        <span className="text-slate-500">
          Changed entity name from &quot;
          <span className="font-medium">{formattedOld}</span>
          &quot; to &quot;<span className="font-medium">{formattedNew}</span>
          &quot;
        </span>
      );

    case 'logo':
    case 'banner':
    case 'bio':
    case 'about':
      const fieldDisplayName = formatFieldName(field);
      return renderSimpleFieldChange(
        wasEmpty,
        isNowEmpty,
        fieldDisplayName,
        formattedNew,
        undefined,
        { includeValue: false },
      );

    case 'industry':
      return renderIndustryChanges(oldValue, newValue);

    case 'twitter':
    case 'linkedin':
    case 'github':
    case 'telegram':
    case 'discord':
      const socialName = formatFieldName(field);
      return renderSimpleFieldChange(
        wasEmpty,
        isNowEmpty,
        socialName,
        formattedNew,
        formattedOld,
      );

    case 'website':
      return renderSimpleFieldChange(
        wasEmpty,
        isNowEmpty,
        'website',
        formattedNew,
        formattedOld,
      );

    case 'slug':
      return (
        <span className="text-slate-500">
          Changed username from {formattedOld} to{' '}
          <span className="font-medium">{formattedNew}</span>
        </span>
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

export default function SponsorEdit({ event }: LogProperties) {
  const data = event.data as EventData<EventType.SPONSOR_PROFILE_EDITED>;

  if (!data.changes || data.changes.length === 0) {
    return <p className="text-slate-500">Edited sponsor profile</p>;
  }

  const changeElements: React.ReactNode[] = [];

  data.changes.forEach((change, index) => {
    changeElements.push(
      <div key={index}>
        {renderFieldChange(change.field, change.oldValue, change.newValue)}
      </div>,
    );
  });

  if (changeElements.length === 0) {
    return <p className="text-slate-500">Edited sponsor profile</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {changeElements.map((element, index) => (
        <p key={index}>{element}</p>
      ))}
    </div>
  );
}
