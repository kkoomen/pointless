import { configureStore } from '@reduxjs/toolkit';
import thunkMiddleware from 'redux-thunk';
import libraryReducer from './reducers/library/librarySlice';
import paperReducer from './reducers/paper/paperSlice';
import routerReducer from './reducers/router/routerSlice';
import settingsReducer from './reducers/settings/settingsSlice';
import { writeTextFile } from '@tauri-apps/api/fs';
import { BASE_DIR, LIBRARY_PATH } from './constants';
import { compress } from 'brotli-unicode'
import { Buffer } from 'buffer';

const saveStateMiddleware = (store) => (next) => async (action) => {
  const result = next(action);

  if (typeof action === 'object') {
    const reducerName = action.type.split('/')[0];
    const actionName = action.type.split('/')[1];

    // Auto-save the library for every library action.
    if (reducerName === 'library' && actionName !== 'load') {
      const state = store.getState();
      const data = await compress(Buffer.from(JSON.stringify(state.library)));
      await writeTextFile(LIBRARY_PATH, data.toString(), { dir: BASE_DIR });
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
