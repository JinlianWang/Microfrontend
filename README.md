# Microfrontend Demo with Nginx

This project demonstrates a local microfrontend architecture using Vite and React. Each frontend is built separately, copied into an Nginx `html/` directory, and then served behind a single reverse proxy so that they appear as one site.

## 🧠 How It Works

- `shell/`: the host shell rendered at `/`. It keeps a persistent header/nav and dynamically mounts whichever microfrontend you pick into a single content slot—no full page reloads. During development it imports each remote's dev entry directly; in production it looks up the emitted bundle via the remote manifest.
- `mfe1/` & `mfe2/`: independent Vite/React bundles mounted under `/mfe1/` and `/mfe2/`. Their configs set `base` to their respective subpaths so Vite emits assets with the proper prefixes. MFE1 now publishes a reusable `<mfe1-shared-timer>` web component (registered via `ensureTimerElement`) and MFE2 demonstrates how another remote can dynamically consume it.
- `remoteEntry.js` (inside each MFE): exposes `mount`/`unmount` helpers so the shell can attach/detach the bundle on demand. The Vite build also emits a `manifest.json` describing the concrete file name for that entry, which the shell reads at runtime when running behind Nginx.
- `dev-all.sh`: boots every Vite dev server at once, wires the shell proxy so `/mfe1` and `/mfe2` resolve correctly on `http://localhost:5173`, streams logs in one terminal, and tears everything down when you hit `Ctrl+C`.
- `dist-all.sh`: builds every app (running `npm install` + `npm run build` for each), wipes `nginx/html`, copies the compiled `dist/` output into the right subfolders, and finishes by running `docker compose up` so the latest bundle is served immediately.
- `nginx/`: contains `default.conf`, which serves the shell at `/` and rewrites `/mfe1/` and `/mfe2/` to the static bundles, using `try_files` so direct deep links fall back to the correct `index.html`.
- `docker-compose.yml`: runs an `nginx:alpine` container that mounts `nginx/html` and `default.conf`, exposing the proxy on `localhost:8080`.

## 📦 Project Structure

```
microfrontend/
├── shell/
├── mfe1/
├── mfe2/
├── nginx/
│   └── default.conf
├── dev-all.sh
├── dist-all.sh
└── docker-compose.yml
```

## 🚀 Development Workflow

1. **Clone and install dependencies**

   ```bash
   git clone <repo-url>
   cd microfrontend
   cd shell && npm install
   cd ../mfe1 && npm install
   cd ../mfe2 && npm install
   cd ..
   ```

2. **Start every dev server**

   ```bash
   ./dev-all.sh
   ```

   What the script does for you:

   - Boots all three Vite dev servers (shell on 5173, MFE1 on 5174, MFE2 on 5175) and keeps their logs streaming in one terminal.
   - Proxies `/mfe1` + `/mfe2` through the shell’s dev server (see `shell/vite.config.js`), so the navigation bar can dynamically import each remote’s `remoteEntry.js` from a single origin.
   - Tears everything down cleanly when you hit `Ctrl+C` thanks to the trap in `dev-all.sh`, so you never leave orphaned processes behind.

3. **Verify locally** – Open `http://localhost:5173/` for the shell, or talk to a remote directly at `http://localhost:5174/` (MFE1) / `http://localhost:5175/` (MFE2) when you need to debug them in isolation.

4. **Manual alternative** – Prefer your own process manager? Launch each app in its directory:

   ```bash
   cd shell && npm run dev -- --port 5173 &
   cd mfe1 && npm run dev -- --port 5174 &
   cd mfe2 && npm run dev -- --port 5175 &
   ```

## 🐳 Distribution Workflow (Docker)

1. **Prepare Docker** – Install Docker Desktop (macOS/Windows) or Docker Engine (Linux), start it, and confirm it responds with `docker --version`.

2. **Build, stage, and serve**

   ```bash
   ./dist-all.sh
   ```

   The script wipes `nginx/html`, builds each app, copies the fresh `dist/` outputs into place, and finally runs `docker compose up` so the reverse proxy immediately serves the new bundles. Leave the process running (Ctrl+C to stop) while you test.

   Need a readable bundle? Any `vite build` command accepts `--minify false`, so you can run `npm run build -- --minify false` inside `shell`, `mfe1`, or `mfe2` (or temporarily edit `dist-all.sh` to pass the same flag) to emit un-minified JS while keeping everything else identical.

   > If Docker errors about `docker-credential-desktop`, remove the `credsStore` key from `~/.docker/config.json` so Compose can pull public images anonymously.

3. **Verify in the browser**

   - Shell: [http://localhost:8080](http://localhost:8080)
   - MFE1: [http://localhost:8080/mfe1/](http://localhost:8080/mfe1/)
   - MFE2: [http://localhost:8080/mfe2/](http://localhost:8080/mfe2/)

4. **Rebuild after code changes** – Docker only serves whatever lives in `nginx/html`. After editing any app, stop the running `docker compose` process (Ctrl+C) and rerun `./dist-all.sh` so fresh assets are staged and served.

   If Compose is running in another terminal, rerun `./dist-all.sh` to rebuild and then execute `docker compose restart` so Nginx reloads the new files.

---

## 🔧 Notes

- Apps use Vite with `base` path configured per route.
- Output of each app is served by Nginx from separate folders.
- Each MFE build generates `.vite/manifest.json` (pointing at `assets/remoteEntry.js`); the shell reads that manifest to figure out which bundle to load when served via Nginx. Keep these files with the deployed assets.
- `mfe1-shared-timer` is a vanilla web component that dispatches an `elapsed-updated` event with `{ elapsedMs }`. Because it is registered globally, any host (shell, MFE2, or future remotes) can simply drop `<mfe1-shared-timer />` into its DOM after calling `ensureTimerElement()`.

## ⏱️ Cross-MFE Timer Demo

To showcase MFEs communicating without tightly coupling React trees, MFE1 exposes a reusable timer element and MFE2 loads it on demand:

1. **MFE1 defines the element** – See `mfe1/src/timerElement.js`. The element handles its own UI and dispatches `elapsed-updated` events whenever the elapsed time changes. The helper `ensureTimerElement()` (re-exported from `src/remoteEntry.js`) registers it only once.
2. **MFE2 lazy-loads the remote** – `mfe2/src/remotes/mfe1Timer.js` dynamically imports MFE1’s `remoteEntry`, calls `ensureTimerElement()`, and then returns a `<mfe1-shared-timer>` node that can be inserted anywhere.
3. **Dialog bridge** – `mfe2/src/components/RemoteTimerBridge.jsx` attaches the element inside a modal when the “Load timer from MFE1” button is pressed. It listens for `elapsed-updated` to keep local React state in sync and mirrors the elapsed duration below the dialog.

Try it out: run `./dev-all.sh`, open `http://localhost:5175/` directly (or view MFE2 through the shell), click the “Load timer from MFE1” button, and interact with the timer inside the dialog. Start/pause/reset actions are handled entirely by the web component, while MFE2 simply reacts to the dispatched events.

## 🔄 How the Shell Loads MFEs After a Click

1. **User interaction** – The header buttons inside `shell/src/index.jsx` simply update React state (`setActiveId(remote.id)`). That state flows into a `useEffect` hook which triggers `activateRemote(activeId)` every time the selection changes.
2. **Remote lookup** – `activateRemote` starts by calling `resolveRemoteUrl`. In dev it returns the hard-coded dev-server entry (e.g., `http://localhost:5174/src/remoteEntry.js`). In production it fetches `/mfe*/.vite/manifest.json`, looks for the `src/remoteEntry.js` entry, and builds a URL such as `/mfe1/assets/remoteEntry.js`.
3. **Dynamic import** – `loadRemoteModule` caches modules per remote ID, performs a dynamic `import()` on the resolved URL, and guarantees the result exposes a `mount` function. The `/* @vite-ignore */` comment keeps Vite from bundling the remote URL at build time so that requests stay dynamic.
4. **Mount lifecycle** – Before showing the new MFE, the shell runs the cleanup function returned by the previous `mount` call (or invokes `module.unmount`). It then empties the shared container `<div>` and invokes `module.mount(container)`. Each remote’s `remoteEntry.js` re-exports `mount`/`unmount` from `bootstrap.jsx`, where a React root is created (or reused) inside that container.
5. **Cleanup guarantees** – The `mount` implementation returns a disposer that unmounts the MFE when called. The shell stores that disposer in a ref so it can be run whenever the user switches tabs or when the shell unmounts entirely. This keeps React roots isolated and prevents memory leaks.

This flow means every button click only swaps the content area while the shell’s header/nav stay mounted. All orchestration lives in `shell/src/index.jsx`, and every remote just needs to expose the `mount` contract.

## 🧭 Why Dev Uses Direct Imports but Prod Reads the Manifest

- **Dev mode (Vite servers)** – When running `./dev-all.sh` the shell proxies `/mfe1` and `/mfe2` to their Vite dev servers. Those servers host the source files directly, so `resolveRemoteUrl` returns the fixed `devEntry` for each remote. That gives you hot-module reloading and avoids building assets on every save.
- **Production mode (static assets)** – After `npm run build`, Vite emits hashed filenames under each `dist/assets/` folder plus `.vite/manifest.json` describing how source files map to those hashed outputs. Because the hash changes per build, the shell cannot hard-code the path, so it fetches the manifest at runtime and pulls the path for `src/remoteEntry.js`.
- **Single source of truth** – Both dev and prod bundles are built from the exact same source files (`remoteEntry.js`, `bootstrap.jsx`, `App.jsx`, etc.). The only difference is where the file is hosted (dev server memory vs. Nginx static assets) and how the final filename is derived (direct path vs. manifest lookup).
- **Parity checks** – To ensure behavior stays identical, exercise both workflows: use `./dev-all.sh` to verify runtime integration with live dev servers, and run `./dist-all.sh` to confirm the manifest-driven lookup works with the built artifacts served through Nginx.

Happy hacking! 🎉
