import { Checkbox } from '@/components/ui/checkbox';

import { type useNotificationState } from '../hooks/useNotificationState';
import { type AlertCategory } from '../types';

interface AlertSettingsItemProps {
  title: string;
  alertId: number;
  alertType: AlertCategory;
  channels: string[];
  disabled?: string[];
  updateSetting: ReturnType<typeof useNotificationState>['updateSetting'];
  getGeneralCheckboxState: ReturnType<
    typeof useNotificationState
  >['getGeneralCheckboxState'];
}

export function AlertSettingsItem({
  title,
  alertId,
  alertType,
  getGeneralCheckboxState,
  updateSetting,
  disabled = [],
  channels,
}: AlertSettingsItemProps) {
  const handleCheckboxChange = (channel: string, checked: boolean) => {
    const updateSettingData =
      channel === 'email' ? { email: checked } : { inApp: checked };
    updateSetting(alertType, alertId, updateSettingData);
  };

  const renderChannelCheckbox = (channel: string) => {
    const checkboxState = getGeneralCheckboxState(alertType, alertId, channel);
    const isDisabled = disabled.includes(channel);

    return (
      <div key={channel} className="flex w-12 justify-center">
        <Checkbox
          className="data-[state=unchecked]:border-slate-200 disabled:bg-slate-100"
          checked={
            checkboxState.indeterminate
              ? 'indeterminate'
              : checkboxState.checked
          }
          disabled={isDisabled}
          onCheckedChange={(checked) =>
            handleCheckboxChange(channel, !!checked)
          }
        />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4">
      <div className="flex items-center gap-2">
        <p className="font-medium text-slate-500">{title}</p>
      </div>
      <div className="flex items-center gap-4">
        {channels.map(renderChannelCheckbox)}
      </div>
    </div>
  );
}
