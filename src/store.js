import { configureStore } from '@reduxjs/toolkit';
import thunkMiddleware from 'redux-thunk';
import libraryReducer, { saveLibrary } from './reducers/library/librarySlice';
import paperReducer from './reducers/paper/paperSlice';
import routerReducer from './reducers/router/routerSlice';
import settingsReducer from './reducers/settings/settingsSlice';

const saveStateMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (typeof action === 'object') {
    const reducerName = action.type.split('/')[0];
    const actionName = action.type.split('/')[1];

    // Auto-save the library for every library action.
    const whitelistedActions = [
      'updateFolderName',
      'updatePaperName',
      'deleteFolder',
      'deletePaper',
    ];

    if (reducerName === 'library' && whitelistedActions.includes(actionName)) {
      store.dispatch(saveLibrary());
    }
  }

  return result;
};

function configureAppStore() {
  const store = configureStore({
    reducer: {
      paper: paperReducer,
      settings: settingsReducer,
      router: routerReducer,
      library: libraryReducer,
    },
    middleware: [saveStateMiddleware, thunkMiddleware],
  });

  return store;
}

export const store = configureAppStore();
