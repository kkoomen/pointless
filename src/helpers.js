import dayjs from 'dayjs';

export function formatDate(date, options) {
  const opts = {
    format: 'YYYY-MM-DD HH:mm',
    relative: true,
    ...options,
  };

  return opts.relative ? dayjs(date).fromNow() : dayjs(date).format(opts.format);
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
  return filename.replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, '_');
}

export function ctrlOrMetaChar(platform) {
  const metaKey = String.fromCharCode(8984);
  return platform === 'darwin' ? metaKey : 'CTRL';
}

/**
 * Check if two objects are recursively the same.
 *
 * @param {object} obj1 - The first object to compare.
 * @param {object} obj2 - The second object to compare.
 * @returns {boolean} True if both object are exactly the same in key-values.
 */
export function isEqual(obj1, obj2) {
  if (obj1 === undefined && obj2 === undefined) {
    return true;
  }

  // Check if either object is undefined or null.
  if (obj1 === undefined || obj1 === null || obj2 === undefined || obj2 === null) {
    return false;
  }

  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }

  // Cecursively check each key-value pair in the objects.
  for (let key in obj1) {
    if (obj1.hasOwnProperty(key) !== obj2.hasOwnProperty(key)) {
      return false;
    } else if (typeof obj1[key] !== typeof obj2[key]) {
      return false;
    }

    if (typeof obj1[key] === 'object') {
      if (!isEqual(obj1[key], obj2[key])) {
        return false;
      }
    } else if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a color is dark or light.
 *
 * @param {string} hex - The hex code to check.
 * @returns {boolean} True when the color is considered a dark color.
 */
export function isDarkColor(hex) {
  if (hex.length === 4) {
    hex = hex.replace(/#(.)(.)(.)/, '#$1$1$2$2$3$3');
  }

  // Convert hex to RGB.
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Check if the color is dark.
  return luminance < 0.5;
}
