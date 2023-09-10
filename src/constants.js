import { BaseDirectory } from '@tauri-apps/api/fs';

export const KEY = {
  SPACEBAR: 32,
  A: 65,
  C: 67,
  E: 69,
  F: 70,
  I: 73,
  Q: 81,
  R: 82,
  S: 83,
  V: 86,
  X: 88,
  Z: 90,
  ZERO: 48,
  ENTER: 13,
  PLUS: 187,
  MINUS: 189,
  LEFT_SQUARE_BRACKET: 219,
  RIGHT_SQUARE_BRACKET: 221,
  DELETE: 46,
  BACKSPACE: 8,
};

export const VIEW_MODE = {
  GRID: 1,
  LIST: 2,
};

export const SORT_BY = {
  NAME_AZ: 1,
  NAME_ZA: 2,
  LAST_MODIFIED_ASC: 3,
  LAST_MODIFIED_DESC: 4,
  CREATED_ASC: 5,
  CREATED_DESC: 6,
};

export const BASE_DIR = BaseDirectory.App;
export const EXPORTS_DIR = BaseDirectory.Download;
