import { createSelector } from '@reduxjs/toolkit';
import { getLibrary } from './get-library';

const getLibraryFolders = createSelector(getLibrary, ({ folders }) => folders);

export { getLibraryFolders };
