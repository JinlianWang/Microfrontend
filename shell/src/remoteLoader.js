const moduleCache = new Map();
const cssCache = new Map();

const injectRemoteCss = (remote, cssFiles = []) => {
  if (typeof document === 'undefined' || !cssFiles.length) {
    return;
  }

  const loaded = cssCache.get(remote.id) ?? new Set();
  cssFiles.forEach((file) => {
    if (!file || loaded.has(file)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${remote.basePath}/${file}`;
    link.dataset.remoteId = remote.id;
    document.head.appendChild(link);
    loaded.add(file);
  });

  cssCache.set(remote.id, loaded);
};

const resolveRemoteUrl = async (remote) => {
  if (import.meta.env.DEV) {
    return remote.devEntry;
  }

  const response = await fetch(remote.manifestPath);
  if (!response.ok) {
    throw new Error(`Failed to load manifest for ${remote.id}`);
  }

  const manifest = await response.json();
  const entry = manifest['src/remoteEntry.js'];
  if (!entry?.file) {
    throw new Error(`Remote entry missing in manifest for ${remote.id}`);
  }

  injectRemoteCss(remote, entry.css);
  return `${remote.basePath}/${entry.file}`;
};

export const loadRemoteModule = async (remote) => {
  if (moduleCache.has(remote.id)) {
    return moduleCache.get(remote.id);
  }

  const url = await resolveRemoteUrl(remote);
  const module = await import(/* @vite-ignore */ url);
  if (typeof module.mount !== 'function') {
    throw new Error(`Remote ${remote.id} does not export a mount function`);
  }

  moduleCache.set(remote.id, module);
  return module;
};
