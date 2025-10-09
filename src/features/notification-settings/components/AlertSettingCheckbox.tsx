import { Checkbox } from '@/components/ui/checkbox';

import { type UseNotificationStateReturn } from '../hooks/useNotificationState';
import { type AlertCategory, AlertChannel } from '../types';

export interface AlertSettingCheckboxProps {
  channel: AlertChannel;
  alertType: AlertCategory;
  alertId: number;
  disabled?: string[];
  updateSetting: UseNotificationStateReturn['updateSetting'];
  getGeneralCheckboxState: UseNotificationStateReturn['getGeneralCheckboxState'];
}

export function AlertSettingCheckbox({
  channel,
  alertType,
  alertId,
  disabled,
  updateSetting,
  getGeneralCheckboxState,
}: AlertSettingCheckboxProps) {
  const handleCheckboxChange = (checked: boolean) => {
    const updateSettingData =
      channel === AlertChannel.EMAIL ? { email: checked } : { inApp: checked };
    updateSetting(alertType, alertId, updateSettingData);
  };

  const checkboxState = getGeneralCheckboxState(alertType, alertId, channel);
  const isDisabled = disabled?.includes(channel) ?? false;
  const checked = checkboxState.indeterminate
    ? ('indeterminate' as const)
    : checkboxState.checked;

  return (
    <Checkbox
      key={channel}
      className="data-[state=unchecked]:border-slate-200 disabled:bg-slate-100"
      checked={checked}
      disabled={isDisabled}
      onCheckedChange={(checked) => handleCheckboxChange(!!checked)}
    />
  );
}
