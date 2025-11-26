import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import styles from './App.module.css';
import { loadRemoteModule } from './remoteLoader';

const remotes = {
  mfe1: {
    id: 'mfe1',
    label: 'MFE 1',
    devEntry: 'http://localhost:5174/src/remoteEntry.js',
    manifestPath: '/mfe1/manifest.json',
    basePath: '/mfe1',
  },
  mfe2: {
    id: 'mfe2',
    label: 'MFE 2',
    devEntry: 'http://localhost:5175/src/remoteEntry.js',
    manifestPath: '/mfe2/manifest.json',
    basePath: '/mfe2',
  },
};
const RemoteView = ({ remote }) => {
  const [status, setStatus] = useState({ loading: true, error: null });
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(true);
  const containerRef = useRef(null);
  const currentCleanupRef = useRef(null);
  const loadToken = useRef(0);
  const initialLoadRef = useRef(true);
  const loadingDelayRef = useRef(null);

  const activateRemote = useCallback(async () => {
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

      const maybeCleanup = module.mount(container, { basename: remote.basePath });
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
  }, [remote]);

  useEffect(() => {
    activateRemote();

    return () => {
      currentCleanupRef.current?.();
      if (loadingDelayRef.current) {
        clearTimeout(loadingDelayRef.current);
        loadingDelayRef.current = null;
      }
    };
  }, [activateRemote]);

  useEffect(() => {
    if (!status.loading) {
      initialLoadRef.current = false;
      setShowLoadingIndicator(false);
      if (loadingDelayRef.current) {
        clearTimeout(loadingDelayRef.current);
        loadingDelayRef.current = null;
      }
      return;
    }

    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      setShowLoadingIndicator(true);
      return;
    }

    setShowLoadingIndicator(false);
    const timer = setTimeout(() => {
      setShowLoadingIndicator(true);
      loadingDelayRef.current = null;
    }, 200);
    loadingDelayRef.current = timer;

    return () => {
      clearTimeout(timer);
      loadingDelayRef.current = null;
    };
  }, [status.loading]);

  return (
    <>
      {status.loading && showLoadingIndicator && (
        <div className={styles.message}>Loading {remote.label}…</div>
      )}
      {status.error && (
        <div className={[styles.message, styles.error].join(' ')}>
          Failed to load {remote.label}: {status.error.message}
        </div>
      )}
      <div ref={containerRef} className={styles.mfeContainer} />
    </>
  );
};

const App = () => {
  const location = useLocation();
  const pathname = location.pathname || '/';
  const activeRemote = useMemo(() => {
    return (
      Object.values(remotes).find((remote) =>
        pathname === remote.basePath || pathname.startsWith(`${remote.basePath}/`)
      ) ?? remotes.mfe1
    );
  }, [pathname]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Shell App</h1>
        <nav className={styles.nav}>
          {Object.values(remotes).map((remote) => (
            <NavLink
              key={remote.id}
              to={remote.basePath}
              end={false}
              className={({ isActive }) => {
                const isCurrent =
                  isActive ||
                  pathname === remote.basePath ||
                  pathname.startsWith(`${remote.basePath}/`);
                return [styles.navButton, isCurrent ? styles.navButtonActive : '']
                  .filter(Boolean)
                  .join(' ');
              }}
            >
              {remote.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className={styles.content}>
        <Routes>
          <Route path="/" element={<Navigate to={remotes.mfe1.basePath} replace />} />
          <Route path="/mfe1/*" element={<RemoteView remote={remotes.mfe1} />} />
          <Route path="/mfe2/*" element={<RemoteView remote={remotes.mfe2} />} />
          <Route path="*" element={<Navigate to={activeRemote.basePath} replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
