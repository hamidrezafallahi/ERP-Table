import { useTranslations } from 'next-intl';

import ViewList from '@components/templates/viewList';
import {
  ICalendar,
  IRequest,
} from '@services/com/calendar/type';

export default function CalendarListPage() {
  const t = useTranslations();

  return (
    <ViewList<ICalendar, IRequest>
      url="/api/com/select/calendar"
      deleteUrl="/api/com/delete/calendar"
      staticKey="CalendarDesc"
      rowFieldKey="CalendarId"
      formUrl="com/calendar"
      addCaption={t("general.addNew")}
      caption={"title.calendarList"}
      baseRepoId={106007}
      EditField="Calendar.CalendarDesc"
    />
  );
}
