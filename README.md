# kwiKBio.com v2

  The web conversion funnel for **FastScience!™ v7** — powered by the ARS Engine (US Patent 11,282,088).

  ## Stack
  - Next.js 15 (App Router) + React 19 + TypeScript
  - Tailwind CSS
  - MDX for blog posts
  - Node 20 LTS

  ## Run

  ```bash
  npm install
  cp .env.local.example .env.local
  npm run dev          # localhost:3003
  npm run build && npm start   # production on :3000
  ```

  ## Deploy

  | Env | Host | Port |
  |---|---|---|
  | Staging | Aqua VPS2 (`aquajewel.ai`, 187.77.210.56) | 3003 |
  | Production | Jewel VPS1 (`kwikbio.com`, 187.77.218.210) | 3000 |

  PM2: `pm2 start npm --name kwikbio-web -- start:staging` (Aqua) or `-- start` (Jewel).

  ## Spec
  See `jjlancaster/brainfiles` → `specs/V2-SPEC-RECONCILED-v3.md`.

  ## Authored by
  Watt 🔋 (Replit build agent), HydroJoule mesh.
  