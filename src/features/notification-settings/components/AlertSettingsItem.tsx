import { Checkbox } from '@/components/ui/checkbox';

import { BASIC_ALERT_COLUMN_WIDTHS } from '../constants';
import { type UseNotificationStateReturn } from '../hooks/useNotificationState';
import { type AlertCategory, AlertChannel } from '../types';
import { AlertSettingsRow } from './AlertSettingsRow';
import { AlertSettingsTitle } from './AlertSettingsTitle';

interface AlertSettingsItemProps {
  title: string;
  alertId: number;
  alertType: AlertCategory;
  disabled?: string[];
  updateSetting: UseNotificationStateReturn['updateSetting'];
  getGeneralCheckboxState: UseNotificationStateReturn['getGeneralCheckboxState'];
}

export function AlertSettingsItem({
  title,
  alertId,
  alertType,
  getGeneralCheckboxState,
  updateSetting,
  disabled = [],
}: AlertSettingsItemProps) {
  const channels = [AlertChannel.EMAIL, AlertChannel.IN_APP];
  const handleCheckboxChange = (channel: AlertChannel, checked: boolean) => {
    const updateSettingData =
      channel === AlertChannel.EMAIL ? { email: checked } : { inApp: checked };
    updateSetting(alertType, alertId, updateSettingData);
  };

  return (
    <AlertSettingsRow
      titleElement={<AlertSettingsTitle value={title} />}
      columnWidths={BASIC_ALERT_COLUMN_WIDTHS}
    >
      {channels.map((channel) => {
        const checkboxState = getGeneralCheckboxState(
          alertType,
          alertId,
          channel,
        );
        const isDisabled = disabled.includes(channel);
        const checked = checkboxState.indeterminate
          ? 'indeterminate'
          : checkboxState.checked;

        return (
          <Checkbox
            key={channel}
            className="data-[state=unchecked]:border-slate-200 disabled:bg-slate-100"
            checked={checked}
            disabled={isDisabled}
            onCheckedChange={(checked) =>
              handleCheckboxChange(channel, !!checked)
            }
          />
        );
      })}
    </AlertSettingsRow>
  );
}
