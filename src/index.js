import { invoke } from '@tauri-apps/api/tauri';
import 'rc-tooltip/assets/bootstrap_white.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import './assets/vendor/bootstrap/bootstrap-grid.min.css';
import App from './components/App';
import Menu from './components/Menu';
import './index.css';
import { loadLibrary } from './reducers/library/librarySlice';
import reportWebVitals from './reportWebVitals';
import { store } from './store';

// Load the library state on load.
invoke('load_library').then((libraryState) => {
  store.dispatch(loadLibrary(libraryState));
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Menu />
      <App />
    </Provider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
