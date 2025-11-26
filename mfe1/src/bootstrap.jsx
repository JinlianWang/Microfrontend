import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

const roots = new WeakMap();
const normalizeBasename = (value = '/') => {
  if (!value) {
    return '/';
  }

  if (value === '/') {
    return value;
  }

  return value.endsWith('/') ? value.slice(0, -1) : value;
};
const defaultBasename = normalizeBasename(import.meta.env.BASE_URL ?? '/');

export const mount = (element, options = {}) => {
  if (!element) {
    throw new Error('MFE1 mount target is missing');
  }

  const basename = normalizeBasename(options.basename ?? defaultBasename);

  let root = roots.get(element);
  if (!root) {
    root = ReactDOM.createRoot(element);
    roots.set(element, root);
  }

  root.render(
    <React.StrictMode>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );

  return () => unmount(element);
};

export const unmount = (element) => {
  const root = roots.get(element);
  if (root) {
    root.unmount();
    roots.delete(element);
  }
};
