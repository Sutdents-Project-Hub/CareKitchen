# Deployment Plan

## Current status

- Deployment is planned; the platform has not been selected.
- A local production build was run with Node.js 24 and tested locally at `127.0.0.1:3014`. No external resources were created.

## Resource naming

| Use | Name |
|---|---|
| GitHub repository / local root | `CareKitchen` |
| Project slug | `carekitchen` |
| Local Docker Compose project | `carekitchen` |

If a primary Compose file is added, set top-level `name: carekitchen`. Use role-based service names such as `web`, `app`, `api`, `cms`, `backend`, `worker`, or `postgres`; normally do not set `container_name`.

## Deployment contract

- Local Compose, if introduced, is for local integration only, not the production entry point.
- After selecting a platform, record the actual base directory, runtime, install/build/start commands, port, health check, environment-variable responsibility, backup, and rollback for each deployable component.
- Derive values only from the actual manifest, Dockerfile, Compose file, or platform configuration. Do not copy another project's domain, port, container, or health-check values.
- Document variable names, purpose, requirement, and secret-management location only. Never write real secrets.
- Before release, record quality checks, human acceptance, version identification, release owner, and a usable rollback procedure.
- Do not create, change, or delete production resources without explicit authorization.

## Future evaluator showcase flow (not deployed)

1. The target is a web URL where evaluators can open the app privately and complete a real conversation. Vercel, Coolify, and other Node hosts have not been selected.
2. The planned deployment is the single `web/` Next.js service. Persistent sessions or read-only sharing would require an approved managed database or equivalent; no database or public URL currently exists.
3. Verify support for the selected Node/Next.js version, Route Handlers, conversation duration, API timeouts, rate limits, HTTPS, and deletion requirements.
4. Keep provider calls server-side. Secrets belong only in server environment settings and must never use `NEXT_PUBLIC_*`.
5. Validate quota and public URL during an authorized deployment. If live AI is unavailable, say so; do not present saved copy as a live model answer.
6. Real-user conversations require decisions on consent, deletion, backup/restore, and publication scope. Do not publish private sessions by default.
7. Planned acceptance includes private-browser access, real example and follow-up turns for servings/budget/exclusions, the recorded `/evidence/waicy` page, and retry behavior. Verify each against the deployed system before claiming success. Public sharing of real conversations is future work.
8. A post-competition production service would require a separate review of law, risk, data policy, and operating cost. A competition demo is not a clinical or long-term-care service.

Still unfilled: hosting/owner, base directory, commands, Node version, port, health check, domain, environment variables, database, backups, and rollback. Do not guess values before verification.
