import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  current: {
    name: 'library',
    args: {},
  },
};

const routerSlice = createSlice({
  name: 'router',
  initialState,
  reducers: {
    to: (state, action) => {
      const { name, args } = action.payload;
      state.current.name = name;
      state.current.args = args;
    },
  },
});

export const { to } = routerSlice.actions;

export default routerSlice.reducer;
