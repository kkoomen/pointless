import { createSelector } from '@reduxjs/toolkit';
import { getLibrary } from './get-library';

const getLibraryPapers = createSelector(getLibrary, ({ papers }) => papers);

export { getLibraryPapers };
