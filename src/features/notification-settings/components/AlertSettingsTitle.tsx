interface AlertSettingsTitleProps {
  value: string;
}

export function AlertSettingsTitle({ value }: AlertSettingsTitleProps) {
  return <p className="font-medium text-slate-500">{value}</p>;
}
