import { mount } from './bootstrap.jsx';

const container = document.getElementById('root');

if (container) {
  mount(container);
}

export { mount, unmount } from './bootstrap.jsx';
