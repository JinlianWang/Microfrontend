# Repository Guidelines

## Project Structure & Module Organization
- `shell/`, `mfe1/`, `mfe2/` each contain an independent Vite + React bundle with their own `src/`, `public/`, and `vite.config.js`. The shell is mounted at `/`, while `mfe1` and `mfe2` live under `/mfe1/` and `/mfe2/` respectively.
- `nginx/` holds the deployment assets: `html/` (populated by builds) and `default.conf` for routing.
- `build-and-copy.sh` orchestrates production builds and copies artifacts into `nginx/html`. `docker-compose.yml` boots the Nginx reverse proxy that serves everything on `localhost:8080`.

## Build, Test, and Development Commands
- `npm install` (run inside each `shell`, `mfe1`, `mfe2` directory) installs dependencies.
- `./dev-all.sh` launches every Vite dev server on known ports (shell:5173, mfe1:5174, mfe2:5175) and proxies `/mfe1` + `/mfe2` through the shell for a single origin workflow. The shell dynamically imports each remote's `remoteEntry.js` so the header stays mounted while the content swaps. Use `Ctrl+C` to stop. When hitting an MFE dev server directly, open `http://localhost:5174/` or `http://localhost:5175/`.
- `npm run dev` inside each app still works if you prefer managing the processes manually.
- `npm run build` produces static assets under `dist/`. The `./build-and-copy.sh` script runs installs, builds all apps, and syncs outputs into `nginx/html/` for serving.
- `docker compose up` serves the most recent build artifacts through Nginx; the shell uses each MFE's `.vite/manifest.json` to locate `/mfe*/assets/remoteEntry.js` at runtime. Stop with `Ctrl+C`.

## Coding Style & Naming Conventions
- Use modern React with functional components and hooks where possible. Keep files in `src/` camelCase (e.g., `AppHeader.jsx`) and React components in PascalCase.
- Follow Prettier-like defaults: 2-space indentation, single quotes in JS, trailing commas where allowed.
- Keep Vite configs declarative and minimal; document non-obvious settings with inline comments.

## Testing Guidelines
- No automated tests exist yet. If you add them, colocate with the feature (e.g., `src/Button.test.jsx`) and use `vitest` or `jest`. Document the chosen runner in `package.json` scripts and update this guide.
- Manual regression: after significant changes run `./build-and-copy.sh` and `docker compose up` to verify routing for `/`, `/mfe1/`, and `/mfe2/`.

## Commit & Pull Request Guidelines
- Craft commits around a single concern; prefer the imperative mood (e.g., `Add link from shell to MFE2 docs`).
- Every PR should describe the change, list manual/automated test evidence, and mention any follow-up work. Include screenshots or terminal output when UI or build behavior changes.

## Security & Configuration Tips
- Never edit files directly inside `nginx/html`; they are regenerated. Modify sources under each app instead.
- Keep local `.env` files out of version control. If new runtime configuration is needed, document variable names and defaults in this guide or the README.
