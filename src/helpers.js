import dayjs from 'dayjs';

export function formatDate(date, format = 'DD-MM-YYYY HH:mm') {
  return dayjs(date).format(format);
}

export function removeDuplicates(arr) {
  return [...new Set(arr)];
}

export function sanitizeFilename(filename) {
  // Remove the following characters that are not allowed by filesystems:
  // - < (less than)
  // - > (greater than)
  // - : (colon)
  // - " (double quote)
  // - / (forward slash)
  // - \ (backslash)
  // - | (vertical bar or pipe)
  // - ? (question mark)
  // - * (asterisk)
  // - Any character with an ASCII code between 0 (null) and 31 (unit separator), inclusive.
  return filename.replace(/[<>:"/\\|?*\\x00-\\x1F]/g, '').replace(/\s+/g, '_');
}
