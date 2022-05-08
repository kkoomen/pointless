import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  paperId: null,
  folderId: null,
};

const paperSlice = createSlice({
  name: 'paper',
  initialState,
  reducers: {
    setCurrentPaper: (state, action) => {
      state.paperId = action.payload;
    },
  },
});

export const { setCurrentPaper } = paperSlice.actions;

export default paperSlice.reducer;
