import { os } from '@tauri-apps/api';
import { createDir } from '@tauri-apps/api/fs';
import { invoke } from '@tauri-apps/api/tauri';
import 'rc-tooltip/assets/bootstrap_white.css';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import './assets/vendor/bootstrap/bootstrap-grid.min.css';
import App from './components/App';
import { BASE_DIR } from './constants';
import './index.css';
import { loadLibrary } from './reducers/library/librarySlice';
import { setDarkMode, setPlatform } from './reducers/settings/settingsSlice';
import reportWebVitals from './reportWebVitals';
import { store } from './store';

(async () => {
  // Always make sure the data dir exists.
  await createDir('data', { dir: BASE_DIR, recursive: true });

  // Load the library state on load.
  invoke('load_library').then((libraryState) => {
    store.dispatch(loadLibrary(libraryState));
  });

  // Update the isDarkMode value when the user changes theme.
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', ({ matches: isDarkMode }) => {
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
})();
