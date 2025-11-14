import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import styles from './App.module.css';
import remotes from './remotes.js';
import { createRemoteLoader } from '@lib/createRemoteLoader.js';

const remoteLoader = createRemoteLoader(remotes);

const App = () => {
  const remoteList = useMemo(() => remoteLoader.listRemotes(), []);
  const defaultApp = remoteList[0]?.id ?? null;
  const [activeId, setActiveId] = useState(defaultApp);
  const [status, setStatus] = useState({ loading: true, error: null });
  const containerRef = useRef(null);
  const currentCleanupRef = useRef(null);
  const loadToken = useRef(0);

  useEffect(() => {
    if (!activeId && remoteList.length) {
      setActiveId(remoteList[0].id);
    }
  }, [activeId, remoteList]);

  const activateRemote = useCallback(async (id) => {
    const remote = remoteLoader.getRemote(id);
    if (!remote) {
      setStatus({ loading: false, error: new Error(`Unknown remote ${id}`) });
      return;
    }

    const token = ++loadToken.current;
    setStatus({ loading: true, error: null });

    try {
      const module = await remoteLoader.loadRemoteModule(remote.id);
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
    if (activeId) {
      activateRemote(activeId);
    }
  }, [activeId, activateRemote]);

  useEffect(() => () => {
    currentCleanupRef.current?.();
  }, []);

  const currentLabel = remoteLoader.getRemote(activeId)?.label ?? 'Microfrontend';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Shell App</h1>
        <nav className={styles.nav}>
          {remoteList.map((remote) => (
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
