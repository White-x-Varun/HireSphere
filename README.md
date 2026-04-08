# Job Sphere Dynamics

Frontend-only version of Job Sphere Dynamics.

## Project Structure

- `frontend` - Vite + React application
- `scripts` - utility/workspace scripts

## Requirements

- Node.js 20+ (Node 22 recommended)
- pnpm 10+

## Install

From the repository root:

```bash
pnpm install --ignore-scripts
```

Note for Windows: this repo has a shell-based root `preinstall` script (`sh`), so `--ignore-scripts` avoids failures in plain CMD/PowerShell environments that do not provide `sh`.

## Run Frontend

From the repository root:

```bash
pnpm --filter "./frontend" run dev
```

Or from inside `frontend`:

```bash
npm run dev
```

Default dev URL:

- `http://localhost:5173`

If `5173` is busy, Vite automatically picks the next free port.

## Build

```bash
pnpm --filter "./frontend" run build
```

## Preview Production Build

```bash
pnpm --filter "./frontend" run serve
```

## Typecheck

```bash
pnpm --filter "./frontend" run typecheck
```

