import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';

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

const moduleCache = new Map();

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

  return `${remote.basePath}/${entry.file}`;
};

const loadRemoteModule = async (remote) => {
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

const App = () => {
  const defaultApp = useMemo(() => remotes.mfe1.id, []);
  const [activeId, setActiveId] = useState(defaultApp);
  const [status, setStatus] = useState({ loading: true, error: null });
  const activeRemote = remotes[activeId];
  const currentLabel = activeRemote?.label ?? 'Microfrontend';
  const containerRef = useRef(null);
  const currentCleanupRef = useRef(null);
  const loadToken = useRef(0);

  const activateRemote = useCallback(async (id) => {
    const remote = remotes[id];
    if (!remote) {
      setStatus({ loading: false, error: new Error(`Unknown remote ${id}`) });
      return;
    }

    const token = ++loadToken.current;
    setStatus({ loading: true, error: null });

    try {
      const module = await loadRemoteModule(remote);
      if (token !== loadToken.current) {
        return;
      }

      currentCleanupRef.current?.();
      const container = containerRef.current;
      if (!container) {
        throw new Error('Shell content container is missing');
      }
      container.innerHTML = '';

      const maybeCleanup = module.mount(container);
      if (typeof maybeCleanup === 'function') {
        currentCleanupRef.current = maybeCleanup;
      } else if (typeof module.unmount === 'function') {
        currentCleanupRef.current = () => module.unmount(container);
      } else {
        currentCleanupRef.current = null;
      }

      setStatus({ loading: false, error: null });
    } catch (error) {
      if (token !== loadToken.current) {
        return;
      }
      setStatus({ loading: false, error });
    }
  }, []);

  useEffect(() => {
    activateRemote(activeId);
  }, [activeId, activateRemote]);

  useEffect(
    () => () => {
      currentCleanupRef.current?.();
    },
    []
  );

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Shell App</h1>
        <nav style={styles.nav}>
          {Object.values(remotes).map((remote) => (
            <button
              key={remote.id}
              type="button"
              onClick={() => setActiveId(remote.id)}
              style={{
                ...styles.navButton,
                ...(activeId === remote.id ? styles.navButtonActive : {}),
              }}
            >
              {remote.label}
            </button>
          ))}
        </nav>
      </header>

      <main style={styles.content}>
        {status.loading && (
          <div style={styles.message}>Loading {currentLabel}…</div>
        )}
        {status.error && (
          <div style={{ ...styles.message, ...styles.error }}>
            Failed to load {currentLabel}: {status.error.message}
          </div>
        )}
        <div ref={containerRef} style={styles.mfeContainer} />
      </main>
    </div>
  );
};

const styles = {
  page: {
    fontFamily: 'sans-serif',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
    color: '#222',
  },
  header: {
    padding: '1rem 2rem',
    backgroundColor: '#111827',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
  },
  nav: {
    display: 'flex',
    gap: '0.75rem',
  },
  navButton: {
    border: '1px solid #374151',
    background: 'transparent',
    color: '#fff',
    padding: '0.35rem 0.75rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  navButtonActive: {
    background: '#2563eb',
    border: '1px solid #2563eb',
  },
  content: {
    flex: 1,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  message: {
    backgroundColor: '#111827',
    color: '#fff',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.95rem',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
  },
  mfeContainer: {
    flex: 1,
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    backgroundColor: '#fff',
    overflow: 'auto',
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
