import { createSelector } from '@reduxjs/toolkit';

const getCurrentPaperId = createSelector(
  (state) => state,
  (state) => state.paper.paperId,
);

export { getCurrentPaperId };
