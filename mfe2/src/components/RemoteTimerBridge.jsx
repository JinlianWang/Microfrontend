import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createTimerElement } from '../remotes/mfe1Timer.js';

const RemoteTimerBridge = ({ onElapsedChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: null });
  const hostRef = useRef(null);
  const timerElementRef = useRef(null);
  const isOpenRef = useRef(false);

  const handleElapsed = useCallback(
    (event) => {
      const elapsedMs = event?.detail?.elapsedMs ?? 0;
      onElapsedChange?.(elapsedMs);
    },
    [onElapsedChange]
  );

  const ensureTimerElement = useCallback(async () => {
    if (timerElementRef.current) {
      return timerElementRef.current;
    }

    const element = await createTimerElement();
    element.addEventListener('elapsed-updated', handleElapsed);
    timerElementRef.current = element;
    return element;
  }, [handleElapsed]);

  const placeElement = useCallback((element) => {
    const attach = () => {
      const host = hostRef.current;
      if (!host) {
        if (isOpenRef.current) {
          setTimeout(attach, 16);
        }
        return;
      }

      if (host.firstChild !== element) {
        host.innerHTML = '';
        host.appendChild(element);
      }
    };

    attach();
  }, []);

  const openDialog = useCallback(async () => {
    setIsOpen(true);
    setStatus({ loading: true, error: null });
    try {
      const element = await ensureTimerElement();
      placeElement(element);
      setStatus({ loading: false, error: null });
    } catch (error) {
      setStatus({ loading: false, error });
      setIsOpen(false);
    }
  }, [ensureTimerElement, placeElement]);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    if (hostRef.current) {
      hostRef.current.innerHTML = '';
    }
  }, []);

  useEffect(
    () => () => {
      const element = timerElementRef.current;
      if (element) {
        element.removeEventListener('elapsed-updated', handleElapsed);
      }
    },
    [handleElapsed]
  );

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  return (
    <div style={styles.wrapper}>
      <button type="button" onClick={openDialog} style={styles.launchButton}>
        Load timer from MFE1
      </button>
      {status.error && !isOpen && (
        <p style={styles.error} role="status">
          Failed to load timer: {status.error.message}
        </p>
      )}

      {isOpen && (
        <div style={styles.backdrop} role="dialog" aria-modal="true">
          <div style={styles.dialog}>
            <header style={styles.dialogHeader}>
              <div>
                <h3 style={styles.dialogTitle}>Shared Timer</h3>
                <p style={styles.dialogSubtitle}>Web component served remotely from MFE1</p>
              </div>
              <button type="button" onClick={closeDialog} style={styles.closeButton} aria-label="Close timer dialog">
                Close
              </button>
            </header>
            <div style={styles.dialogBody}>
              <div ref={hostRef} style={styles.timerHost} />
              {status.loading && (
                <p style={styles.loading}>Preparing timer…</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  launchButton: {
    border: 'none',
    borderRadius: '999px',
    background: '#0ea5e9',
    color: 'white',
    fontWeight: 600,
    padding: '0.65rem 1rem',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  error: {
    color: '#b91c1c',
    margin: 0,
    fontSize: '0.9rem',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    padding: '1rem',
  },
  dialog: {
    background: 'white',
    borderRadius: '1rem',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.3)',
    overflow: 'hidden',
  },
  dialogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1rem 1.25rem 0.5rem',
    gap: '1rem',
  },
  dialogTitle: {
    margin: 0,
  },
  dialogSubtitle: {
    margin: '0.25rem 0 0',
    color: '#475569',
    fontSize: '0.9rem',
  },
  closeButton: {
    border: '1px solid #cbd5f5',
    borderRadius: '999px',
    background: 'white',
    fontSize: '0.9rem',
    lineHeight: 1,
    padding: '0.35rem 0.9rem',
    cursor: 'pointer',
    color: '#475569',
  },
  dialogBody: {
    padding: '0 1.25rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  timerHost: {
    minHeight: '150px',
    border: '1px dashed #cbd5f5',
    borderRadius: '0.75rem',
    padding: '0.75rem',
    background: '#f8fafc',
  },
  loading: {
    margin: 0,
    color: '#475569',
    fontSize: '0.9rem',
  },
};

export default RemoteTimerBridge;
