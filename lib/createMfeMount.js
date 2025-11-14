import ReactDOM from 'react-dom/client';

// Small helper used by every MFE bootstrap. It hides the repetitive
// ReactDOM.createRoot logic and gives the shell a consistent pair of
// `mount`/`unmount` functions to call when swapping MFEs in and out.
//
// render: (root: ReactDOM.Root, element: HTMLElement) => void
//   Callback provided by the MFE that actually renders <App /> into the
//   supplied root/element pair. We keep this generic so each MFE can wrap
//   its own context providers, StrictMode, etc.
export const createMfeMount = (render) => {
  debugger;
  // Each DOM node the shell hands us gets its own React root; we keep
  // track of them so we can unmount cleanly when an MFE is swapped.
  const roots = new WeakMap();

  const unmount = (element) => {
    const root = roots.get(element);
    if (root) {
      root.unmount();
      roots.delete(element);
    }
  };

  const mount = (element) => {
    if (!element) {
      throw new Error('Microfrontend mount target is missing');
    }

    let root = roots.get(element);
    if (!root) {
      root = ReactDOM.createRoot(element);
      roots.set(element, root);
    }

    // The caller (each MFE) decides how to render into the root. This
    // function only ensures the root exists and returns a disposer.
    render(root, element);
    return () => unmount(element);
  };

  return { mount, unmount };
};
