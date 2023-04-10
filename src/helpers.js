import dayjs from 'dayjs';

export function formatDate(date, format = 'DD-MM-YYYY HH:mm') {
  return dayjs(date).format(format);
}

export function removeDuplicates(arr) {
  return [...new Set(arr)];
}
