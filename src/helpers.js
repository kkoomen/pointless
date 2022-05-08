import dayjs from 'dayjs';

export function formatDate(date, format = 'DD-MM-YYYY HH:mm') {
  return dayjs(date).format(format);
}
