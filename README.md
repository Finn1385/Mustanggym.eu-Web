# mustanggym.eu

Website of Mustang Gym, Snina: Next.js (App Router) with a built-in admin at `/admin` for opening hours, the class timetable, prices, photos and contact details. Content lives in SQLite on a persistent volume; changes are live as soon as they are saved.

## Stack

- Next.js 16 (`output: "standalone"`), React 19, Tailwind CSS 4
- SQLite via `better-sqlite3` + Drizzle ORM (migrations in `db/migrations`)
- Better Auth (email + password, optional TOTP 2FA, sign-up disabled, login rate limiting)
- `sharp` for uploads (EXIF stripped, max 2560 px, WebP) and `next/image` for responsive AVIF/WebP

## Local development

```sh
npm install
cp .env.example .env.local   # set BETTER_AUTH_SECRET, and BETTER_AUTH_URL/SITE_URL=http://localhost:3000
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='at-least-12-chars' npm run dev
```

On first start the server migrates `.data/mustang.db`, seeds it with the content of the original static site (hours, timetable, prices, photos from `db/seed-media`) and creates the admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD` if no user exists yet. Log in at <http://localhost:3000/admin>.

Append `?now=2026-10-10T19:00` to a public URL (development only) to preview the "today" states at a given time.

| Command | |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint`, `npm run typecheck` | checks (CI runs both plus the builds) |
| `npm run db:generate` | create a migration after editing `db/schema.ts` |
| `npm run admin:create -- --email a@b.sk [--name Meno] [--reset]` | add a user or reset a password |
| `npm run backup` | write `.data/backups/mustang-zaloha-YYYY-MM-DD.tar.gz` |

## Layout

```
app/(site)/            public pages: /, /fitness, /treningy (+ OG images)
app/admin/             login + protected admin screens
app/media/[file]       serves uploaded photos from DATA_DIR/uploads
app/api/auth, api/health
db/                    schema, migrations, seed, bootstrap (run from instrumentation.ts)
lib/content/           queries + Zod schemas for settings
lib/admin/             server actions (every one calls requireAdmin()), auth guard, users
lib/hours.ts           open/closed logic in Europe/Bratislava
scripts/               backup + create-admin CLIs (bundled to dist/scripts for the container)
```

## Deploying on Coolify

1. **New resource → Application** from this GitHub repository, branch `main`, **Build pack: Dockerfile**, port `3000`.
2. **Persistent storage:** add a volume mounted at **`/data`** (database, uploads, backups). Use a named volume, not a bind mount, so it's owned by the container user (uid 1001).
3. **Environment variables:**
   - `BETTER_AUTH_SECRET` – `openssl rand -hex 32`
   - `BETTER_AUTH_URL` and `SITE_URL` – `https://mustanggym.eu`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` – only for the first deploy; remove them after logging in
4. **Domains:** `https://mustanggym.eu,https://www.mustanggym.eu`, redirect to non-www. Coolify's proxy issues the certificates.
5. **Health check:** path `/api/health`, port `3000`. Coolify runs it with `curl` inside the container, which the image includes. The image also defines its own Docker `HEALTHCHECK`.
6. **Scheduled task** (nightly backup): command `node scripts/backup.mjs`, frequency `0 3 * * *`. It keeps the newest 14 archives in `/data/backups`; copy them off the server from time to time (or add an S3 sync). The admin overview also has a **Stiahnuť zálohu** button.
7. Keep a **single replica**: SQLite is a file on one volume.

Auto-deploy on push is handled by Coolify's GitHub integration. Migrations run automatically when the new container starts.

**Lost password:** open the container terminal in Coolify and run `node scripts/create-admin.mjs --email you@example.com --reset`.

**Restore a backup:** stop the app, extract the archive into the volume (`mustang.db` and `uploads/`), delete any `mustang.db-wal`/`-shm` files, start the app.

### Moving the domain from GitHub Pages

Deploy first on a temporary Coolify domain and check it. Then point the `A`/`AAAA` records of `mustanggym.eu` (and `www`) to the VPS, add the domain in Coolify, and once the certificate is issued disable GitHub Pages for the old repository. Old URLs (`/fitness.html`, `/treningy.html`, `/redukcia.html`, `/kalkulacka.html`) redirect permanently. Finally submit `https://mustanggym.eu/sitemap.xml` in Google Search Console and make sure the address and phone in the Google Business Profile match the website.
