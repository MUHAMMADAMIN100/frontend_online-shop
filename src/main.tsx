import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '../src/app/store';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom'; // добавляем импорт

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter> {/* оборачиваем App */}
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
