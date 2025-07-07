import { Eye, Settings } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/utils/cn';

export interface ColumnDefinition<ColumnKey extends string = string> {
  key: ColumnKey;
  label: React.ReactNode;
}

interface ColumnVisibilitySettingsProps<ColumnKey extends string = string> {
  /**
   * Ordered list of column definitions that can be toggled.
   */
  columns: ColumnDefinition<ColumnKey>[];
  /**
   * Map of current visibility state keyed by column key.
   */
  visibleColumns: Record<ColumnKey, boolean>;
  /**
   * Callback to toggle a column key. Should update the parent state.
   */
  toggleColumn: (key: ColumnKey) => void;
  /**
   * Optional extra class names for the trigger button.
   */
  className?: string;
}

export function useColumnVisibility<ColumnKey extends string = string>(
  storageKey: string,
  defaultVisible: Record<ColumnKey, boolean>,
) {
  const getInitialState = (): Record<ColumnKey, boolean> => {
    if (typeof window === 'undefined') return defaultVisible;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        return JSON.parse(raw) as Record<ColumnKey, boolean>;
      }
    } catch (_) {
      /* ignore */
    }
    return defaultVisible;
  };

  const [visibleColumns, setVisibleColumns] =
    useState<Record<ColumnKey, boolean>>(getInitialState);

  // Persist changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
    } catch (_) {
      /* ignore */
    }
  }, [storageKey, visibleColumns]);

  const toggleColumn = useCallback((key: ColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return {
    visibleColumns,
    toggleColumn,
    setVisibleColumns,
  } as const;
}

export function ColumnVisibilitySettings<ColumnKey extends string = string>(
  props: ColumnVisibilitySettingsProps<ColumnKey>,
) {
  const { columns, visibleColumns, toggleColumn, className } = props;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-4 w-4', className)}
          onClick={(e) => e.stopPropagation()}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-56 flex-col p-1.5">
        <span className="px-1.5 py-2 text-xs text-slate-400">
          SHOW IN TABLE
        </span>
        <div className="flex flex-col">
          {columns.map(({ key, label }) => (
            <Button
              key={key}
              variant="ghost"
              size="sm"
              className={cn(
                'h-fit w-full items-center justify-between gap-3 p-1.5',
                visibleColumns[key]
                  ? 'text-slate-600 hover:text-slate-600'
                  : 'text-slate-400 hover:text-slate-400',
              )}
              onClick={() => toggleColumn(key)}
            >
              <span className="text-wrap text-sm">{label}</span>
              <Eye className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
