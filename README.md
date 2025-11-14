# Microfrontend Demo with Nginx

This project demonstrates a local microfrontend architecture using Vite and React. Each frontend is built separately, copied into an Nginx `html/` directory, and then served behind a single reverse proxy so that they appear as one site.

## 🧠 How It Works

- `shell/`: the host shell rendered at `/`. It keeps a persistent header/nav and dynamically mounts whichever microfrontend you pick into a single content slot—no full page reloads. During development it imports each remote's dev entry directly; in production it looks up the emitted bundle via the remote manifest.
- `mfe1/` & `mfe2/`: independent Vite/React bundles mounted under `/mfe1/` and `/mfe2/`. Their configs set `base` to their respective subpaths so Vite emits assets with the proper prefixes.
- `lib/`: lightweight utilities reused by MFEs and the shell:
  - `createMfeMount.js` exposes consistent `mount`/`unmount` helpers per MFE.
  - `createRemoteLoader.js` discovers remote bundles via `.vite/manifest.json`.
- `remoteEntry.js` (inside each MFE): exposes `mount`/`unmount` helpers so the shell can attach/detach the bundle on demand. The Vite build also emits a `manifest.json` describing the concrete file name for that entry, which the shell reads at runtime when running behind Nginx.
- `dist-all.sh`: builds every app (running `npm install` + `npm run build` for each), wipes `nginx/html`, copies the compiled `dist/` output into `nginx/html`, and then starts `docker compose up` so the freshly built assets are served immediately.
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
├── dist-all.sh
└── docker-compose.yml
```

## 🚀 Local Development Setup

### 1. Clone and enter the repo

```bash
git clone <repo-url>
cd microfrontend
```

### Dev mode workflow (hot reload)

1. Install dependencies inside each app:
   ```bash
   cd shell && npm install
   cd ../mfe1 && npm install
   cd ../mfe2 && npm install
   cd ..
   ```
2. Start all dev servers with one command:
   ```bash
   ./dev-all.sh
   ```
   - Boots the shell on `http://localhost:5173/` and proxies `/mfe1` + `/mfe2` so everything lives on one origin.
   - Stop with `Ctrl+C` (the script cleans up all child processes).
3. Prefer separate terminals? Run `npm run dev` inside `shell/`, `mfe1/`, and `mfe2/` manually (ports 5173–5175).

### Docker dist workflow (production parity)

1. Install Docker Desktop or Docker Engine and confirm `docker --version`.
2. Build/stage all assets and start Nginx in one shot:
   ```bash
   ./dist-all.sh
   ```
   - The script installs deps (if needed), builds every app, copies outputs into `nginx/html`, and then runs `docker compose up`.
   - Shell: `http://localhost:8080`
   - Standalone MFEs: `/mfe1`, `/mfe2`
3. Press `Ctrl+C` to stop the proxy. Re-run `./dist-all.sh` whenever you need fresh builds or to restart the container.

---

## 🔧 Notes

- Apps use Vite with `base` path configured per route.
- Output of each app is served by Nginx from separate folders.
- Each MFE build generates `.vite/manifest.json` (pointing at `assets/remoteEntry.js`); the shell reads that manifest to figure out which bundle to load when served via Nginx. Keep these files with the deployed assets.
- Shared helpers live under `lib/`. If you add new MFEs, import `@lib/createMfeMount` inside their bootstrap files and register the remote inside `shell/src/remotes.js` so the loader can discover it.

### Shared Utilities & Dynamic Loading

1. Each MFE bundles a `src/remoteEntry.js` that re-exports `mount/unmount` from its bootstrap file.
2. The MFE’s standalone `index.html` / `src/index.jsx` files are only used when you visit the MFE directly (e.g., `http://localhost:8080/mfe1/`). When the shell loads an MFE dynamically, it skips those entry points entirely and imports `src/remoteEntry.js` instead.
3. The shell keeps the remote registry in `shell/src/remotes.js` with metadata for dev (`devEntry`) and prod (`manifestPath`, `basePath`).
4. When you click an MFE button, `createRemoteLoader` fetches the manifest (`.vite/manifest.json`), injects the CSS files it references, dynamically imports the hashed `remoteEntry.js`, and hands back the remote's `mount` function.
5. Each MFE’s bootstrap uses `createMfeMount` so the shell sees a consistent API: `const cleanup = mount(container)` when entering, and `cleanup()` (or `unmount`) when leaving.
6. Because the shell keeps both the loaded module and injected CSS in memory, switching back to an MFE reuses the cached assets instantly.

Happy hacking! 🎉
