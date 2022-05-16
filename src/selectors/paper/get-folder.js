import { createSelector } from '@reduxjs/toolkit';
import { getLibraryFolders } from '../library/get-folders';
import { getCurrentPaper } from './get-current-paper';

const getFolder = createSelector(getLibraryFolders, getCurrentPaper, (folders, currentPaper) =>
  folders.find((folder) => folder.id === currentPaper?.folderId),
);

export { getFolder };
