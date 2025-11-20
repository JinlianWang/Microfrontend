import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './App.module.css';
import { loadRemoteModule } from './remoteLoader';

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
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Shell App</h1>
        <nav className={styles.nav}>
          {Object.values(remotes).map((remote) => (
            <button
              key={remote.id}
              type="button"
              onClick={() => setActiveId(remote.id)}
              className={[
                styles.navButton,
                activeId === remote.id ? styles.navButtonActive : '',
              ].join(' ')}
            >
              {remote.label}
            </button>
          ))}
        </nav>
      </header>

      <main className={styles.content}>
        {status.loading && (
          <div className={styles.message}>Loading {currentLabel}…</div>
        )}
        {status.error && (
          <div className={[styles.message, styles.error].join(' ')}>
            Failed to load {currentLabel}: {status.error.message}
          </div>
        )}
        <div ref={containerRef} className={styles.mfeContainer} />
      </main>
    </div>
  );
};

export default App;
