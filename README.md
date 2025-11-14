# Microfrontend Demo with Nginx

This project demonstrates a local microfrontend architecture using Vite and React. Each frontend is built separately, copied into an Nginx `html/` directory, and then served behind a single reverse proxy so that they appear as one site.

## 🧠 How It Works

- `shell/`: the host shell rendered at `/`. It keeps a persistent header/nav and dynamically mounts whichever microfrontend you pick into a single content slot—no full page reloads. During development it imports each remote's dev entry directly; in production it looks up the emitted bundle via the remote manifest.
- `mfe1/` & `mfe2/`: independent Vite/React bundles mounted under `/mfe1/` and `/mfe2/`. Their configs set `base` to their respective subpaths so Vite emits assets with the proper prefixes.
- `remoteEntry.js` (inside each MFE): exposes `mount`/`unmount` helpers so the shell can attach/detach the bundle on demand. The Vite build also emits a `manifest.json` describing the concrete file name for that entry, which the shell reads at runtime when running behind Nginx.
- `build-and-copy.sh`: builds every app (running `npm install` + `npm run build` for each), wipes `nginx/html`, and copies the compiled `dist/` output into `nginx/html`, nesting the MFEs into `nginx/html/mfe1` and `nginx/html/mfe2`.
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
├── build-and-copy.sh
└── docker-compose.yml
```

## 🚀 Local Development Setup

### 1. Clone and enter the repo

```bash
git clone <repo-url>
cd microfrontend
```

### 2. Prepare Docker

Install Docker Desktop (macOS/Windows) or Docker Engine (Linux) if it is not already available, start it, then confirm it responds:

```bash
docker --version
```

### 3. Install app dependencies

`npm` is already available, so install packages for each app:

```bash
cd shell && npm install
cd ../mfe1 && npm install
cd ../mfe2 && npm install
cd ..
```

### 4. Live development with Vite proxies

To work on all MFEs with hot reload on a single origin, start every Vite dev server with the helper script:

```bash
./dev-all.sh
```

The script boots `shell` on `http://localhost:5173/` and proxies `/mfe1/` and `/mfe2/` (including their assets + HMR connections) to the other dev servers. Clicking the nav buttons swaps the content slot by dynamically importing each remote's `remoteEntry.js`, so you can test composition without reloading. Stop with `Ctrl+C` (the script tears down every process for you).

Prefer running servers manually? Start each in its directory instead:

```bash
cd shell && npm run dev -- --port 5173 &
cd mfe1 && npm run dev -- --port 5174 &
cd mfe2 && npm run dev -- --port 5175 &
```

### 5. Build and stage assets for Nginx

```bash
./build-and-copy.sh
```

The script builds all apps and copies `dist/` outputs into `nginx/html/`.

### 6. Start the Dockerized Nginx proxy

```bash
docker compose up
```

Leave this running (Ctrl+C to stop) and it will serve the staged assets.

> If Docker errors about `docker-credential-desktop`, remove the `credsStore` key from `~/.docker/config.json` so Compose can pull public images anonymously.

### 7. Verify in the browser

- Shell: [http://localhost:8080](http://localhost:8080)
- MFE1: [http://localhost:8080/mfe1/](http://localhost:8080/mfe1/)
- MFE2: [http://localhost:8080/mfe2/](http://localhost:8080/mfe2/)

### 8. Pick up code changes

Docker only serves whatever lives in `nginx/html`. After editing any app, rerun the build script and bounce the container so the new static files are staged and reloaded:

```bash
./build-and-copy.sh
docker compose restart
```

If the container is stopped, run `docker compose up` (or `-d`) after the build instead.

---

## 🔧 Notes

- Apps use Vite with `base` path configured per route.
- Output of each app is served by Nginx from separate folders.
- Each MFE build generates `.vite/manifest.json` (pointing at `assets/remoteEntry.js`); the shell reads that manifest to figure out which bundle to load when served via Nginx. Keep these files with the deployed assets.

Happy hacking! 🎉
