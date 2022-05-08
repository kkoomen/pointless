import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isDarkMode: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
  },
});

export const { setDarkMode } = settingsSlice.actions;

export default settingsSlice.reducer;
