const remotes = {
  mfe1: {
    id: 'mfe1',
    label: 'MFE 1',
    devEntry: 'http://localhost:5174/src/remoteEntry.js',
    manifestPath: '/mfe1/.vite/manifest.json',
    basePath: '/mfe1',
  },
  mfe2: {
    id: 'mfe2',
    label: 'MFE 2',
    devEntry: 'http://localhost:5175/src/remoteEntry.js',
    manifestPath: '/mfe2/.vite/manifest.json',
    basePath: '/mfe2',
  },
};

export default remotes;
