# MASTER_BUILD_DIRECTIONS.md — How to execute master_build.md locally → Git → Netlify
**Last updated:** 2026-01-28  
**Purpose:** This is the “operator manual.” Follow it step-by-step to build and deploy the Campaign Compliance module described in `master_build.md` (v3).  
**Assumption:** You have the Blueprints repo (parallel build) and will add this module into it.

---

## 0) What you will end up with
- A new app at: `apps/campaign_compliance/` (Next.js 14 App Router + Tailwind)
- New Postgres schema: `campaign` (isolated tables)
- A build-progress webpage at: `/build-map` that reflects `master_build.md` step statuses
- Working flows:
  - Contributions wizard
  - Expenses wizard + Spending Analysis drilldown
  - Travel intake + timeline + commit-to-expense
  - Filing Prep (date range → blockers → HTML preview → SOS CSV download)
- Netlify deploy that builds and serves `apps/campaign_compliance`

---

## 1) Files you must place into the repo BEFORE you begin
### 1.1 Add these two files at repo root
- `master_build.md`  ✅ (use the latest: `master_build_v3.md` content)
- `MASTER_BUILD_DIRECTIONS.md` ✅ (this file)

**Exact action**
1) Copy `master_build_v3.md` → rename to `master_build.md` at repo root.
2) Put this file at repo root too.

**Why**
- The build map generator reads `../../master_build.md` from inside the app.
- Keeping it at repo root prevents path drift and makes the module portable.

---

## 2) Your optimum “build loop” (the fastest way to execute the plan)
This is the loop you will repeat for every step ID (P1-01, P1-02, …):

1) Open `master_build.md`
2) Find the next step with `**Status:** NOT_STARTED`
3) Implement exactly what it says
4) Run the acceptance checks listed
5) Update `master_build.md`:
   - Change that step’s status to `DONE`
   - If a step spans multiple commits, temporarily set it to `IN_PROGRESS`
6) Commit to git with the required commit tag
7) Push to GitHub
8) Confirm Netlify deploy (or preview locally)

That’s it. No improvisation.

---

## 3) Local machine prerequisites (do this once)
### 3.1 Install
- Node.js LTS (18+ or 20+ recommended)
- npm (bundled) or pnpm (optional)
- Git
- Postgres access credentials for the existing DB

### 3.2 Clone the repo
```bash
git clone <YOUR_REPO_URL>
cd <YOUR_REPO_ROOT>
```

### 3.3 Install dependencies (repo root)
Use whatever the repo already uses (npm/pnpm). If unsure:
```bash
npm install
```

---

## 4) Database prerequisites (do this once)
You need:
- `DATABASE_URL` that points to the **existing Postgres database**
- ability to run SQL scripts against it

### 4.1 Confirm pgcrypto is available
We use `gen_random_uuid()`. Ensure extension exists:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### 4.2 Recommended: create a “campaign schema bootstrap” runbook
You will run SQL scripts in order:
1) `db/sql/006_campaign_schema.sql`
2) `db/sql/007_campaign_contrib.sql`
3) `db/sql/008_campaign_expenses.sql`
4) travel + exports SQL (from `master_build.md` Phase 4/5)

**How to run SQL**
- Use your preferred tool (psql, TablePlus, DBeaver, Supabase SQL editor, etc.)
- Run each script once; they are designed to be re-runnable (idempotent-ish)

---

## 5) Add the new app (start executing Phase 1)
From here forward you will follow `master_build.md` line-by-line.

### 5.1 Open in Cursor
- Open the repo root folder in Cursor
- Keep two files pinned:
  - `master_build.md`
  - `MASTER_BUILD_DIRECTIONS.md`

### 5.2 Start with Phase 1
Execute in order:
- P1-01 → P1-14  
Then Phase 2 steps, etc.

**Critical speed tip**
Do not jump phases. Finish a phase and confirm deploy before moving on.

---

## 6) Environment variables (local + Netlify)
### 6.1 Local `.env` for campaign_compliance app
Create:
- `apps/campaign_compliance/.env.local`

Include:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
OPENAI_API_KEY=""   # keep blank until Phase 7
```

> Note: Prisma ignores `?schema=` when using multi-schema; we keep it simple. Your DB host may require SSL params.

### 6.2 Netlify env vars
In Netlify → Site Settings → Environment Variables, set:
- `DATABASE_URL`
- (future) `OPENAI_API_KEY`

---

## 7) Netlify: the most reliable deployment setup (recommended)
### 7.1 Connect your Git repo
- Create a new Netlify site from GitHub
- Choose your repo

### 7.2 Build settings (recommended)
**Base directory:** repo root  
**Build command:**
```bash
cd apps/campaign_compliance && npm install && npm run build
```

**Publish directory:**
- If using Netlify Next runtime/plugin, follow existing repo convention.
- If the repo already deploys `apps/public_site` successfully, mirror that approach for this app.

### 7.3 If the repo uses Netlify Next plugin
Check `netlify.toml` or existing site config.
- If a plugin exists for Next, reuse it.
- If not, add it only after Phase 1 works locally.

---

## 8) Prisma workflow (how to avoid pain)
### 8.1 Your fastest, safest pattern
Because the DB already exists and we are introducing a new schema, do this:

1) Run the SQL scripts first (authoritative schema)
2) Update Prisma models to match the DB (exact mapping)
3) Run:
```bash
npx prisma generate
```

**Do not rely on Prisma migrate to create tables** unless your repo already uses it consistently and you want Prisma to own the DDL.
This plan is written with SQL-first DDL to guarantee exact structure.

---

## 9) “Drop this in a thread and it starts going” (how to use this with an AI build agent)
If you’re using ChatGPT/Cursor agentic mode:

### 9.1 The payload to paste (recommended)
Paste in this order:
1) `MASTER_BUILD_DIRECTIONS.md`
2) `master_build.md`
3) Any repo constraints:
   - existing `netlify.toml`
   - existing Prisma patterns
   - any DB connection constraints

Then instruct:
- “Execute Phase 1, step by step. Do not skip acceptance criteria. After each step, update master_build.md statuses and propose the git commit message, but do not actually run git commands unless I say so.”

### 9.2 The operating rules you want the agent to follow
- Never create extra features outside the step being executed
- Never change SOS columns arrays
- Never add new tables beyond what the current step specifies
- Always keep the home page minimal

---

## 10) Exactly what YOU need to do (operator checklist)
### 10.1 One-time setup checklist
- [ ] Clone repo locally
- [ ] Copy `master_build.md` (from v3) into repo root
- [ ] Copy this `MASTER_BUILD_DIRECTIONS.md` into repo root
- [ ] Create `apps/campaign_compliance/.env.local` with `DATABASE_URL`
- [ ] Confirm you can connect to Postgres
- [ ] Confirm `pgcrypto` is enabled
- [ ] Connect repo to Netlify (or be ready after Phase 1)

### 10.2 Build execution checklist (repeat per step)
For each `P*-**` step:
- [ ] Implement the described files/changes
- [ ] Run the acceptance check
- [ ] Update step status in `master_build.md`
- [ ] Commit with the specified tag
- [ ] Push
- [ ] Confirm Netlify deploy (or local run if you are mid-phase)

---

## 11) Debugging playbook (fast triage)
### 11.1 “DB connection failing locally”
- Confirm `.env.local` exists in `apps/campaign_compliance`
- Confirm Next server actions/routes are reading env in server context
- Confirm DB accepts your IP (if hosted)
- Confirm SSL requirements (some providers require `sslmode=require`)

### 11.2 “Prisma can’t see campaign schema”
- Confirm datasource includes: `schemas = ["public","private","campaign"]`
- Confirm schema exists in DB: `SELECT schema_name FROM information_schema.schemata;`
- Confirm models have `@@schema("campaign")`

### 11.3 “Build map isn’t updating”
- Confirm `npm run build` runs `npm run build:status`
- Confirm the generator points to `../../master_build.md`
- Confirm `public/build-status.json` is being written

### 11.4 “CSV rejected by SOS”
- Compare exported CSV headers vs SOS template (must match exactly)
- Ensure column order matches array order
- Ensure date formatting and numeric formatting match expected

---

## 12) Recommended build order (most efficient)
1) Phase 1 (shell + settings + build map) — deploy proof
2) Phase 2 (contacts + contributions) — validate entry flow
3) Phase 3 (expenses + analysis) — validate categorization and drilldown
4) Phase 4 (travel + commit) — validate linked expense creation
5) Phase 5 (filing prep + exports) — validate SOS upload readiness
6) Phase 6 (hardening) — polish + packaging

---

## 13) What you should send me next (if you want me to tune this to your exact repo)
If you paste these snippets (no secrets):
- `netlify.toml`
- the root `package.json` workspaces (if any)
- `apps/public_site/package.json`
- `db/prisma/schema.prisma` datasource block

…I can adjust the deployment + Prisma integration instructions to match your exact setup perfectly.

