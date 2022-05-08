import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  folders: [],
  papers: [],
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    newFolder: (state) => {
      state.folders.push({
        id: uuidv4(),
        name: 'Untitled',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    },
    newPaperInFolder: (state, action) => {
      const folderId = action.payload;
      state.papers.push({
        id: uuidv4(),
        name: 'Untitled',
        folderId: folderId,
        points: [],
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    },
    updateFolderName: (state, action) => {
      const { id, name } = action.payload;
      for (let i = 0; i < state.folders.length; i++) {
        if (state.folders[i].id === id) {
          state.folders[i].name = name;
          state.folders[i].updatedAt = new Date().toISOString();
          break;
        }
      }
    },
    updatePaperName: (state, action) => {
      const { id, name } = action.payload;
      for (let i = 0; i < state.papers.length; i++) {
        if (state.papers[i].id === id) {
          state.papers[i].name = name;
          state.papers[i].updatedAt = new Date().toISOString();
          break;
        }
      }
    },
    setPaperPoints: (state, action) => {
      const { id, points } = action.payload;
      for (let i = 0; i < state.papers.length; i++) {
        if (state.papers[i].id === id) {
          state.papers[i].points = points;
          state.papers[i].updatedAt = new Date().toISOString();
          break;
        }
      }
    },
    deleteFolder: (state, action) => {
      const folderId = action.payload;

      // Delete the folder itself.
      state.folders = state.folders.filter((folder) => folder.id !== folderId);

      // Delete all the corresponding papers.
      state.papers = state.papers.filter((paper) => paper.folderId !== folderId);
    },
    deletePaper: (state, action) => {
      const id = action.payload;
      state.papers = state.papers.filter((paper) => paper.id !== id);
    },
    loadLibrary: (state, action) => {
      if (action.payload) {
        state.folders = action.payload.folders;
        state.papers = action.payload.papers;
      }
    },
  },
});

export const {
  newFolder,
  newPaperInFolder,
  updateFolderName,
  updatePaperName,
  setPaperPoints,
  deleteFolder,
  deletePaper,
  loadLibrary,
} = librarySlice.actions;

export default librarySlice.reducer;
