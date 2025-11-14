const manifestCache = new Map();

// Remote metadata is static (served from nginx), so we cache the
// manifest JSON per remote. This avoids an extra network request every
// time the shell switches MFEs.
const fetchManifest = async (remote) => {
  if (manifestCache.has(remote.id)) {
    return manifestCache.get(remote.id);
  }

  const response = await fetch(remote.manifestPath);
  if (!response.ok) {
    throw new Error(`Failed to load manifest for ${remote.id}`);
  }

  const manifest = await response.json();
  manifestCache.set(remote.id, manifest);
  return manifest;
};

// Each manifest tells us which file represents `src/remoteEntry.js` and
// any CSS chunks it emitted. We gather them into a simple array so the
// shell can inject the styles before mounting the remote.
// manifest: the parsed `.vite/manifest.json` for a given remote.
// entry: the manifest entry for `src/remoteEntry.js`.
const collectCssFiles = (manifest, entry) => {
  const files = new Set(entry?.css ?? []);
  Object.values(manifest).forEach((item) => {
    if (item && typeof item.src === 'string' && item.src.endsWith('.css') && item.file) {
      files.add(item.file);
    }
  });
  return Array.from(files);
};

// remotes: object map keyed by remote id. Each entry should contain:
//   - id: string (matches the key)
//   - devEntry: URL served by Vite dev server (e.g., http://localhost:5174/...)
//   - manifestPath: path served by nginx for the manifest (e.g., /mfe1/.vite/manifest.json)
//   - basePath: production base path under nginx (e.g., /mfe1)
export const createRemoteLoader = (remotes) => {
  const moduleCache = new Map();
  const injectedCss = new Set();

  const resolveRemoteResource = async (remote) => {
    if (import.meta.env.DEV) {
      return { url: remote.devEntry, cssFiles: [] };
    }

    const manifest = await fetchManifest(remote);
    const entry = manifest['src/remoteEntry.js'];
    if (!entry?.file) {
      throw new Error(`Remote entry missing in manifest for ${remote.id}`);
    }

    return {
      url: `${remote.basePath}/${entry.file}`,
      cssFiles: collectCssFiles(manifest, entry),
    };
  };

  // Production builds output plain CSS files. We append <link> tags once
  // per file so each MFE still looks correct when it is mounted in the
  // shell's single-page viewport.
  const injectCss = (remote, cssFiles) => {
    cssFiles.forEach((cssFile) => {
      const normalizedBase = remote.basePath.endsWith('/')
        ? remote.basePath.slice(0, -1)
        : remote.basePath;
      const href = `${normalizedBase}/${cssFile.replace(/^\//, '')}`;
      if (injectedCss.has(href)) {
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
      injectedCss.add(href);
    });
  };

  // Loads (and caches) the remote module described in remotes[id]. The
  // returned object exposes the `mount` function that was exported from
  // the remote's bootstrap file. Subsequent loads reuse the cached ES
  // module to avoid re-downloading JS.
  const loadRemoteModule = async (id) => {
    if (moduleCache.has(id)) {
      return moduleCache.get(id);
    }

    const remote = remotes[id];
    if (!remote) {
      throw new Error(`Unknown remote: ${id}`);
    }

    const { url, cssFiles } = await resolveRemoteResource(remote);
    injectCss(remote, cssFiles);

    const imported = await import(/* @vite-ignore */ url);
    const mount = imported.mount ?? imported.default?.mount;
    const unmount = imported.unmount ?? imported.default?.unmount;

    if (typeof mount !== 'function') {
      throw new Error(`Remote ${id} does not export a mount function`);
    }

    const resolved = {
      mount,
      unmount: typeof unmount === 'function' ? unmount : undefined,
      module: imported,
      cssFiles,
    };

    moduleCache.set(id, resolved);
    return resolved;
  };

  return {
    listRemotes: () => Object.values(remotes),
    getRemote: (id) => remotes[id],
    loadRemoteModule,
    clearCache: () => moduleCache.clear(),
  };
};
