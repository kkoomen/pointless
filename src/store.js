import { configureStore } from '@reduxjs/toolkit';
import thunkMiddleware from 'redux-thunk';
import libraryReducer from './reducers/library/librarySlice';
import paperReducer from './reducers/paper/paperSlice';
import routerReducer from './reducers/router/routerSlice';
import settingsReducer from './reducers/settings/settingsSlice';

function configureAppStore() {
  const store = configureStore({
    reducer: {
      paper: paperReducer,
      settings: settingsReducer,
      router: routerReducer,
      library: libraryReducer,
    },
    middleware: [thunkMiddleware],
  });

  return store;
}

export const store = configureAppStore();
