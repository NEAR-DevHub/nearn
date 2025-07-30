import { type EventDataMap, type EventType } from '../../types/event-data';
import { type LogProperties } from '.';
import SimpleLogMessage from './SimpleLogMessage';

export default function PlatformArchivedOrUnarchived(props: LogProperties) {
  const { event } = props;

  const data =
    event.data as EventDataMap[EventType.PLATFORM_ADMIN_ARCHIVED_OR_UNARCHIVED];
  let type;
  if (event.submission) {
    type = 'submission';
  } else if (event.listing) {
    type = 'listing';
  } else if (event.sponsor) {
    type = 'sponsor';
  }

  const message = data.isArchived ? 'Archived' : 'Unarchived';

  return <SimpleLogMessage message={`${message} the ${type}`} />;
}
