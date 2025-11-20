const remoteConfig = {
  id: 'mfe1',
  devEntry: 'http://localhost:5174/src/remoteEntry.js',
  manifestPath: '/mfe1/manifest.json',
  basePath: '/mfe1',
};

let modulePromise;
const loadedCss = new Set();

const injectCss = (files = []) => {
  if (typeof document === 'undefined' || !files.length) {
    return;
  }

  files.forEach((file) => {
    if (!file || loadedCss.has(file)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${remoteConfig.basePath}/${file}`;
    link.dataset.remoteId = remoteConfig.id;
    document.head.appendChild(link);
    loadedCss.add(file);
  });
};

const resolveRemoteUrl = async () => {
  if (import.meta.env.DEV) {
    return remoteConfig.devEntry;
  }

  const response = await fetch(remoteConfig.manifestPath);
  if (!response.ok) {
    throw new Error(`Failed to load manifest for ${remoteConfig.id}`);
  }

  const manifest = await response.json();
  const entry = manifest['src/remoteEntry.js'];
  if (!entry?.file) {
    throw new Error('Remote entry file missing from manifest');
  }

  injectCss(entry.css);
  return `${remoteConfig.basePath}/${entry.file}`;
};

const loadRemoteModule = async () => {
  if (!modulePromise) {
    modulePromise = resolveRemoteUrl().then((url) => import(/* @vite-ignore */ url));
  }

  return modulePromise;
};

const ensureTimerDefined = async () => {
  const module = await loadRemoteModule();
  if (typeof module.ensureTimerElement !== 'function') {
    throw new Error('Timer element is not exposed by MFE1');
  }

  module.ensureTimerElement();
};

export const createTimerElement = async () => {
  await ensureTimerDefined();
  return document.createElement('mfe1-shared-timer');
};
