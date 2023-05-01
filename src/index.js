import { os } from '@tauri-apps/api';
import { createDir, readTextFile } from '@tauri-apps/api/fs';
import 'rc-tooltip/assets/bootstrap_white.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import './assets/vendor/bootstrap/bootstrap-grid.min.css';
import App from './components/App';
import './index.css';
import { loadLibrary } from './reducers/library/librarySlice';
import { setDarkMode, setPlatform } from './reducers/settings/settingsSlice';
import reportWebVitals from './reportWebVitals';
import { store } from './store';
import { BASE_DIR, LIBRARY_PATH } from './constants';
import { decompress } from 'brotli-unicode'
import { Buffer } from 'buffer';

(async () => {

  // Always make sure the data dir exists.
  await createDir('data', { dir: BASE_DIR, recursive: true });

  // Load the saved library state.
  readTextFile(LIBRARY_PATH, { dir: BASE_DIR }).then(async (contents) => {
    const decompressed = await decompress(contents);
    const decompressedString = Buffer.from(decompressed).toString();
    const libraryState = JSON.parse(decompressedString);
    store.dispatch(loadLibrary(libraryState));
  }).catch(() => {});

  // Update the isDarkMode value when the user changes theme.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({matches: isDarkMode}) => {
    store.dispatch(setDarkMode(isDarkMode));
  });

  // Detect the users's platform.
  os.platform().then((platform) => {
    store.dispatch(setPlatform(platform));
  });

  createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <App />
    </Provider>,
  );

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();

})()
