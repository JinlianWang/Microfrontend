import React from 'react';
import App from './App.jsx';
import { createMfeMount } from '@lib/createMfeMount.js';

const { mount, unmount } = createMfeMount((root) => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

export { mount, unmount };
