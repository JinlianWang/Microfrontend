import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

const roots = new WeakMap();

export const mount = (element) => {
  if (!element) {
    throw new Error('MFE2 mount target is missing');
  }

  let root = roots.get(element);
  if (!root) {
    root = ReactDOM.createRoot(element);
    roots.set(element, root);
  }

  root.render(
    <React.StrictMode>
      <App />
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
