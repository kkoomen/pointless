import { createSelector } from '@reduxjs/toolkit';
import { getLibraryPapers } from '../library/get-papers';
import { getCurrentPaperId } from './get-paper-id';

const getCurrentPaper = createSelector(getLibraryPapers, getCurrentPaperId, (papers, paperId) =>
  papers.find((paper) => paper.id === paperId),
);

export { getCurrentPaper };
