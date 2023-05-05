import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)'),
  platform: null,
  appVersion: null,
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
  },
});

export const { setDarkMode, setPlatform, setAppVersion } = settingsSlice.actions;

export default settingsSlice.reducer;
