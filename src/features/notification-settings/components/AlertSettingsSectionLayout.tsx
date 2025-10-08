import type { ReactNode } from 'react';

interface AlertSettingsSectionLayoutProps {
  title: string;
  columnNames: string[];
  children: ReactNode;
}

export const AlertSettingsSectionLayout = ({
  title,
  columnNames,
  children,
}: AlertSettingsSectionLayoutProps) => {
  return (
    <div className="space-y-3">
      <div className="mb-3 grid grid-cols-[1fr_auto] items-center gap-4">
        <p className="text-sm font-medium uppercase tracking-[0.8px] text-slate-400">
          {title}
        </p>
        <div className="flex gap-4">
          {columnNames.map((columnName, index) => (
            <p
              key={index}
              className={`text-center text-sm text-slate-400 ${
                columnName === 'Listings' ? 'w-20' : 'w-12'
              }`}
            >
              {columnName}
            </p>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
};
