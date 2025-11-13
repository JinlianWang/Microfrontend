# Microfrontend Demo with Nginx

This project demonstrates a local microfrontend architecture using Vite and React. Each frontend is built separately, copied into an Nginx `html/` directory, and then served behind a single reverse proxy so that they appear as one site.

## 🧠 How It Works

- `shell/`: the host shell rendered at `/`. It is just a Vite/React bundle that links to each microfrontend. Because it is mounted at the root, its `vite.config.js` keeps `base: '/'` so assets resolve from the site root.
- `mfe1/` & `mfe2/`: independent Vite/React bundles mounted under `/mfe1/` and `/mfe2/`. Their configs set `base` to their respective subpaths so Vite emits assets with the proper prefixes.
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

### 4. Build and stage assets for Nginx

```bash
./build-and-copy.sh
```

The script builds all apps and copies `dist/` outputs into `nginx/html/`.

### 5. Start the Dockerized Nginx proxy

```bash
docker-compose up
```

Leave this running (Ctrl+C to stop) and it will serve the staged assets.

### 6. Verify in the browser

- Shell: [http://localhost:8080](http://localhost:8080)
- MFE1: [http://localhost:8080/mfe1/](http://localhost:8080/mfe1/)
- MFE2: [http://localhost:8080/mfe2/](http://localhost:8080/mfe2/)

---

## 🔧 Notes

- Apps use Vite with `base` path configured per route.
- Output of each app is served by Nginx from separate folders.

Happy hacking! 🎉
