import { createSlice } from '@reduxjs/toolkit';
import { LINEWIDTH } from '../../components/Paper/constants';
import { SORT_BY } from '../../constants';
import { invoke } from '@tauri-apps/api';

const initialState = {
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)'),
  platform: null,
  appVersion: null,
  sortPapersBy: SORT_BY.NAME_AZ,
  canvasPreferredLinewidth: LINEWIDTH.SMALL,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
    setPlatform: (state, action) => {
      state.platform = action.payload;
    },
    setAppVersion: (state, action) => {
      state.appVersion = action.payload;
    },
    setPreferredLinewidth: (state, action) => {
      state.canvasPreferredLinewidth = action.payload;
    },
    setSortPapersBy: (state, action) => {
      state.sortPapersBy = action.payload;
    },
    loadSettings: (state, action) => {
      if (action.payload && typeof action.payload === 'object') {
        if (Object.values(SORT_BY).includes(action.payload.sortPapersBy)) {
          state.sortPapersBy = action.payload.sortPapersBy;
        }

        if (Object.values(LINEWIDTH).includes(action.payload.canvasPreferredLinewidth)) {
          state.canvasPreferredLinewidth = action.payload.canvasPreferredLinewidth;
        }
      }
    },
  },
});

export const saveSettings = () => async (dispatch, getState) => {
  const { sortPapersBy, canvasPreferredLinewidth } = getState().settings;
  const settings = {
    sortPapersBy,
    canvasPreferredLinewidth,
  };

  await invoke('save_settings', { settings: JSON.stringify(settings) });
};

export const {
  setDarkMode,
  setPlatform,
  setAppVersion,
  loadSettings,
  setSortPapersBy,
  setPreferredLinewidth,
} = settingsSlice.actions;

export default settingsSlice.reducer;
