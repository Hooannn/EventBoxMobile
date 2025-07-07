import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';
dayjs.extend(relativeTime);

import weekday from 'dayjs/plugin/weekday';
dayjs.extend(weekday);

export const setLocale = (locale: 'vi' | 'en' | null) => {
  return dayjs.locale(locale as string);
};
export default dayjs;
