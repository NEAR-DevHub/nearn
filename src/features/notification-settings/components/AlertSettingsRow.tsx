import { Children, type ReactElement, type ReactNode } from 'react';

interface AlertSettingsRowProps {
  titleElement: ReactElement;
  columnWidths: string[];
  children: ReactNode;
}

export function AlertSettingsRow({
  titleElement,
  columnWidths,
  children,
}: AlertSettingsRowProps) {
  const gridTemplateColumns = `1fr ${columnWidths.join(' ')}`;

  const renderChildren = () => {
    const flatChildren = Children.toArray(children);

    return flatChildren.map((child, index) => (
      <div
        key={index}
        className="flex justify-center"
        style={{ width: columnWidths[index] }}
      >
        {child}
      </div>
    ));
  };

  return (
    <div className="grid items-center gap-4" style={{ gridTemplateColumns }}>
      {titleElement}
      {renderChildren()}
    </div>
  );
}
