# Deployment Plan

## Current status

- The app is hosted at <https://carekitchen-theta.vercel.app>. The deployment was created outside the repository workflow; the Vercel project settings, import method, deployed commit and environment variables have not been audited in this document.
- Checked on November 27, 2026 without a sign-in: `/` and `/evidence/waicy` returned HTTP 200, and `GET /api/chat` returned `{"mode":"openai"}`.
- 23 invented chat requests sent through a headless browser all returned HTTP 200; 18 included a model decision. [Raw record](evidence/runs/live-deploy-2026-11-27.json). One request mentioning “an oven” was misread as an ingredient; the app asked for confirmation and showed no meals.
- The settings below are the prepared reference, and the local checks further down predate the hosted release.

## Vercel project settings (prepared reference)

| Setting | Value |
|---|---|
| Repository | `Sutdents-Project-Hub/CareKitchen` (public) |
| Framework Preset | Next.js (automatic detection) |
| Root Directory | `web` |
| Production Branch | `main` |
| Node.js Version | `24.x` (`web/package.json` declares `^24.0.0`) |
| Install Command | Keep Vercel default |
| Build Command | Keep Vercel default (`next build`) |
| Output Directory | Keep Vercel default (`.next`) |
| Corepack | Add Production environment variable `ENABLE_EXPERIMENTAL_COREPACK=1` to honor `packageManager: pnpm@10.33.0` in `web/package.json` |

The `web/` directory contains its own `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`; no repository files outside `web/` are needed to build the app. Do not add a `vercel.json` just to repeat the automatic Next.js defaults.

If Git import or automatic deployment is unavailable, from a clean checkout export only the deployable app and link that temporary directory to the Vercel project (Root Directory `./`):

```sh
verify_dir=$(mktemp -d /tmp/carekitchen-vercel.XXXXXX)
git archive HEAD:web | tar -x -C "$verify_dir"
cd "$verify_dir"
vercel link
# Add CAREKITCHEN_CHAT_MODE and OPENAI_API_KEY in the Vercel Production environment.
vercel deploy --prod
```

This CLI path requires a separately authorized Vercel deployment. Run it from an up-to-date intended commit. It uploads the `web/` source as a standalone project; future Git pushes will not deploy this project automatically. Vercel's [Git deployment guide](https://vercel.com/docs/git) describes Hobby restrictions for private organization repositories; the current CareKitchen repository is public. Try GitHub import first and use this path only if import or automatic deployment is unavailable.

## Server environment

- `OPENAI_API_KEY` is read only by `web/lib/server/openai.ts`; the chat route uses the Node.js runtime. For the competition demo, set `CAREKITCHEN_CHAT_MODE=openai` and add `OPENAI_API_KEY` only in Vercel's Production environment. `OPENAI_MODEL` is optional and defaults to `gpt-6-luna`. Never create a `NEXT_PUBLIC_*` version or put the key in repository files.
- `auto` uses OpenAI when a key is configured and otherwise uses local rules; `local` guarantees no provider call; `openai` without a key returns 503. A production key and its possible API charges require separate authorization and have not been configured.

## Local source-archive verification

Run from a fresh archive of the selected Git revision, with ignored files and local `.env` files excluded:

```sh
cd web
pnpm install --frozen-lockfile
pnpm build
CAREKITCHEN_CHAT_MODE=local pnpm start
```

Smoke-check `/`, `/evidence/waicy`, and `GET /api/chat` (expected mode: `local`); a local-mode chat request can verify the route without using the OpenAI API. Record the tested revision and results before claiming local build readiness. This does not replace a real Vercel deployment or browser acceptance.

Verified against source revision `9dc54889012c613b886f908a081d3be1e2ea7fb1` using Node `v24.16.0` and pnpm `10.33.0`: `pnpm install --frozen-lockfile` completed, `pnpm build` completed, `/` and `/evidence/waicy` returned HTTP 200, `GET /api/chat` returned `{"mode":"local"}`, and a sample `POST /api/chat` returned a local response without model metadata. The archive did not contain `web/.env.local`; the request did not call OpenAI. This is local evidence only, not a Vercel deployment or evaluator acceptance.

## Remaining deployment checks

- Confirm the Vercel project's Node version, production branch, deployed commit, environment variables, API spending limit, backup and rollback.
- Check error and retry behavior on the hosted app and watch API usage during judging.
- The app stores conversation state in the browser tab and has no server-side session persistence. A competition demo is not a clinical or long-term-care service.
