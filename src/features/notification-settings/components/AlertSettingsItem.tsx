import { BASIC_ALERT_COLUMN_WIDTHS, CHANNEL_LABELS } from '../constants';
import { type UseNotificationStateReturn } from '../hooks/useNotificationState';
import { type AlertCategory, AlertChannel } from '../types';
import { AlertSettingCheckbox } from './AlertSettingCheckbox';
import { AlertSettingsRow } from './AlertSettingsRow';
import { AlertSettingsTitle } from './AlertSettingsTitle';

interface AlertSettingsItemProps {
  title: string;
  alertType: AlertCategory;
  alertId: number;
  disabled?: string[];
  updateSetting: UseNotificationStateReturn['updateSetting'];
  getGeneralCheckboxState: UseNotificationStateReturn['getGeneralCheckboxState'];
}

export function AlertSettingsItem(props: AlertSettingsItemProps) {
  return (
    <>
      <div className="hidden sm:block">
        <DesktopAlertSettingsItem {...props} />
      </div>
      <div className="block sm:hidden">
        <MobileAlertSettingsItem {...props} />
      </div>
    </>
  );
}

function DesktopAlertSettingsItem({
  title,
  alertType,
  alertId,
  disabled,
  updateSetting,
  getGeneralCheckboxState,
}: AlertSettingsItemProps) {
  const channels = [AlertChannel.EMAIL, AlertChannel.IN_APP];

  const checkboxes = channels.map((channel) => (
    <AlertSettingCheckbox
      key={channel}
      channel={channel}
      alertType={alertType}
      alertId={alertId}
      disabled={disabled}
      updateSetting={updateSetting}
      getGeneralCheckboxState={getGeneralCheckboxState}
    />
  ));

  return (
    <AlertSettingsRow
      titleElement={<AlertSettingsTitle value={title} />}
      columnWidths={BASIC_ALERT_COLUMN_WIDTHS}
    >
      {checkboxes}
    </AlertSettingsRow>
  );
}

function MobileAlertSettingsItem({
  title,
  alertType,
  alertId,
  disabled,
  updateSetting,
  getGeneralCheckboxState,
}: AlertSettingsItemProps) {
  const channels = [AlertChannel.EMAIL, AlertChannel.IN_APP];

  return (
    <div className="space-y-3">
      <AlertSettingsTitle value={title} />
      <div className="space-y-4 pl-8">
        {channels.map((channel) => (
          <div key={channel} className="flex items-center justify-between">
            <span className="text-slate-500">{CHANNEL_LABELS[channel]}</span>
            <AlertSettingCheckbox
              channel={channel}
              alertType={alertType}
              alertId={alertId}
              disabled={disabled}
              updateSetting={updateSetting}
              getGeneralCheckboxState={getGeneralCheckboxState}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
