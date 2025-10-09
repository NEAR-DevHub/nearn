import type { ReactNode } from 'react';

import { AlertSettingsRow } from './AlertSettingsRow';

interface AlertSettingsSectionLayoutProps {
  title: string;
  columnWidths: string[];
  columnNames: string[];
  children: ReactNode;
}

export const AlertSettingsSectionLayout = ({
  title,
  columnWidths,
  columnNames,
  children,
}: AlertSettingsSectionLayoutProps) => {
  const titleElement = (
    <p className="text-sm font-medium uppercase tracking-[0.8px] text-slate-400">
      {title}
    </p>
  );

  return (
    <div className="space-y-3">
      <AlertSettingsRow titleElement={titleElement} columnWidths={columnWidths}>
        {columnNames.map((columnName, index) => (
          <p key={index} className="text-center text-sm text-slate-400">
            {columnName}
          </p>
        ))}
      </AlertSettingsRow>
      {children}
    </div>
  );
};
