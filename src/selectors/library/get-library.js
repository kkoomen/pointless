import { createSelector } from '@reduxjs/toolkit';

const getLibrary = createSelector(
  (state) => state,
  (state) => state.library,
);

export { getLibrary };
