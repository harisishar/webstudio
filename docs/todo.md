# Webstudio Deployment Todo: Vercel + Supabase

A checklist to track progress deploying Webstudio on Vercel with Supabase.

---

## Phase 1: Supabase Project Setup

- [x] Create Supabase account at https://supabase.com
- [x] Create new Supabase project
  - [x] Set project name
  - [x] Generate and save database password securely
  - [x] Select region closest to users
- [x] Wait for project provisioning (~2 minutes)
- [x] Get database connection strings:
  - [x] Copy `DATABASE_URL` (with pooler/pgbouncer)
  - [x] Copy `DIRECT_URL` (direct connection for migrations)
- [x] Get PostgREST credentials:
  - [x] Copy Project URL
  - [x] Copy `anon` public key -> `POSTGREST_API_KEY`

---

## Phase 2: Database Migration

- [x] Clone/prepare Webstudio repository
- [x] Install dependencies: `pnpm install`
- [x] Build prisma-client: `pnpm --filter @webstudio-is/prisma-client generate`
- [x] Configure `packages/prisma-client/.env`:
  - [x] Set `DATABASE_URL`
  - [x] Set `DIRECT_URL`
- [x] Run migrations: `pnpm migrations migrate --dev`
- [ ] Verify tables in Supabase Dashboard -> Table Editor:
  - [ ] User
  - [ ] Team
  - [ ] Project
  - [ ] Build
  - [ ] File
  - [ ] Asset
  - [ ] Domain
  - [ ] ProjectDomain
  - [ ] AuthorizationToken
  - [ ] Product
  - [ ] TransactionLog
  - [ ] ClientReferences
  - [ ] \_prisma_migrations

---

## Phase 3: Supabase Storage Configuration

- [ ] Create storage bucket:
  - [ ] Go to Supabase Dashboard -> Storage
  - [ ] Click "New bucket"
  - [ ] Name: `assets`
  - [ ] Enable "Public bucket"
  - [ ] Set file size limit (e.g., 50MB)
- [ ] Configure bucket policies:
  - [ ] Add "Public Access" policy for SELECT
  - [ ] Add "Authenticated Upload" policy for INSERT
  - [ ] Add "Authenticated Delete" policy for DELETE
- [ ] Get S3 credentials:
  - [ ] Go to Project Settings -> Storage -> S3 Access Keys
  - [ ] Generate new access key
  - [ ] Copy Access Key ID
  - [ ] Copy Secret Access Key
- [ ] Note S3 endpoint: `https://[PROJECT-REF].supabase.co/storage/v1/s3`

---

## Phase 4: OAuth Configuration

### Google OAuth (Required)

- [x] Go to https://console.cloud.google.com/apis/credentials
- [x] Create OAuth client ID (Web application)
- [x] Set Authorized origins: `https://your-domain.vercel.app`
- [x] Set Redirect URI: `https://your-domain.vercel.app/auth/google/callback`
- [x] Copy Client ID -> `GOOGLE_CLIENT_ID`
- [x] Copy Client Secret -> `GOOGLE_CLIENT_SECRET`

### GitHub OAuth (Removed)

- [x] ~~GitHub authentication has been removed from this deployment~~

---

## Phase 5: Generate Secrets

- [x] Generate AUTH_SECRET:
  ```bash
  openssl rand -hex 32
  ```
- [x] Save generated secret securely

---

## Phase 6: Vercel Deployment

- [ ] Connect repository to Vercel
- [ ] Configure build settings:
  - [ ] Framework Preset: Remix
  - [ ] Root Directory: `apps/builder`
  - [ ] Build Command: `pnpm build`
  - [ ] Install Command: `pnpm install`
- [ ] Add environment variables in Vercel:

  ### Database

  - [ ] `DATABASE_URL`
  - [ ] `DIRECT_URL`

  ### PostgREST

  - [ ] `POSTGREST_URL`
  - [ ] `POSTGREST_API_KEY`

  ### Authentication

  - [ ] `AUTH_SECRET`

  ### OAuth (Google Only)

  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`

  ### Storage

  - [ ] `S3_ENDPOINT`
  - [ ] `S3_REGION` = `auto`
  - [ ] `S3_BUCKET` = `assets`
  - [ ] `S3_ACCESS_KEY_ID`
  - [ ] `S3_SECRET_ACCESS_KEY`

  ### Optional

  - [ ] `MAX_UPLOAD_SIZE` = `50`
  - [ ] `MAX_ASSETS_PER_PROJECT` = `100`
  - [ ] `FEATURES` = `*`
  - [ ] `USER_PLAN` = `pro`
  - [ ] `DEV_LOGIN` = `true` (for development login)

- [ ] Deploy to production: `vercel --prod`

---

## Phase 7: Post-Deployment Verification

- [x] Dev server starts successfully (`pnpm dev`)
- [ ] Homepage loads successfully
- [ ] OAuth login works (Google)
- [ ] Dev login works (if enabled)
- [ ] Can create new project
- [ ] Can upload image asset
- [ ] Uploaded assets display correctly
- [ ] Can publish project

---

## Phase 8: Production Hardening (Optional)

- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Configure CORS in Supabase Authentication settings
- [ ] Set up monitoring/error tracking (Sentry)
- [ ] Configure asset CDN
- [ ] Set up database backups
- [ ] Document deployed configuration

---

## Environment Variables Checklist

```bash
# Required
DATABASE_URL=                    # [x]
DIRECT_URL=                      # [x]
POSTGREST_URL=                   # [x]
POSTGREST_API_KEY=               # [x]
AUTH_SECRET=                     # [x]

# OAuth (Google Only - GitHub removed)
GOOGLE_CLIENT_ID=                # [x]
GOOGLE_CLIENT_SECRET=            # [x]

# Storage
S3_ENDPOINT=                     # [ ]
S3_REGION=auto                   # [ ]
S3_BUCKET=assets                 # [ ]
S3_ACCESS_KEY_ID=                # [ ]
S3_SECRET_ACCESS_KEY=            # [ ]

# Optional
MAX_UPLOAD_SIZE=50               # [ ]
MAX_ASSETS_PER_PROJECT=100       # [ ]
FEATURES=*                       # [ ]
USER_PLAN=pro                    # [ ]
DEV_LOGIN=true                   # [x]
```

---

## Quick Reference

| Resource             | URL                                               |
| -------------------- | ------------------------------------------------- |
| Supabase Dashboard   | https://supabase.com/dashboard                    |
| Vercel Dashboard     | https://vercel.com/dashboard                      |
| Google Cloud Console | https://console.cloud.google.com/apis/credentials |
| Deployment Guide     | [docs/vercel+supabase.md](./vercel+supabase.md)   |

---

## Changes Made

### GitHub Auth Removed

- Removed `remix-auth-github` from `apps/builder/package.json`
- Removed GitHub strategy from `apps/builder/app/services/auth.server.ts`
- Removed GitHub button from `apps/builder/app/auth/login.tsx`
- Deleted `apps/builder/app/routes/auth.github.tsx`
- Deleted `apps/builder/app/routes/auth.github_.callback.tsx`

### Local Development

Dev server running at: `https://wstd.dev:5173/`

---

## Notes

_Add your deployment notes here_

---

_Reference: See [docs/vercel+supabase.md](./vercel+supabase.md) for detailed instructions_
