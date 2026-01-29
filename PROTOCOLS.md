# PROJECT PROTOCOLS
## Campaign Compliance Build System

This document defines the **non-negotiable operating rules** for building, modifying, and validating this repository.

These protocols exist to:
- prevent architectural drift
- ensure the filesystem reflects the plan
- allow deterministic, phase-based progress
- enable the system to monitor and audit itself over time

If the repo and the plan disagree, **the repo is wrong**.

---

## 1. PLAN AUTHORITY

### 1.1 Canonical Planning Documents
The following files are authoritative:

- `master_build.md` — the canonical build plan and current-state contract
- `MASTER_BUILD_DIRECTIONS.md` — narrative intent and architectural guidance
- `PROTOCOLS.md` — *this document*
- `PHASE_LOG.md` — authoritative historical record (append-only)

All build decisions must trace back to these files.

No file may be added, moved, or modified under a plan-bound root without alignment to the plan.

---

## 2. GOVERNANCE EPOCHS (CRITICAL)

This project is governed in **epochs**, not just phases.

### 2.1 Epoch 1 — Legacy Discipline (Phases 0–3)
- Phases 0–3 were built under disciplined but evolving governance.
- Artifacts from these phases are preserved **as-built**.
- History is never rewritten.
- Legacy artifacts may exist that predate strict enforcement.

### 2.2 Epoch 2 — Strict Enforcement (Phase 4+)
Phase 4 marks the beginning of **strict governance enforcement**.

From Phase 4 onward:
- All new or modified files must be explicitly claimed in the plan.
- Phase-scoped enforcement is the default.
- Legacy artifacts are treated as **LEGACY_READONLY** unless explicitly extended.
- No silent expansion of scope is permitted.

Epoch transitions do **not** rewrite history.  
Historical truth lives in `PHASE_LOG.md`.

---

## 3. NO-DRIFT PRINCIPLE

> If a file is referenced in the plan and does not exist in the repo, the project is **OFF-PLAN**.

> If a file exists in the repo under a plan-bound root and is not referenced in the plan, **DRIFT HAS OCCURRED**.

The filesystem is treated as a **living enforcement layer** for the plan.

---

## 4. PHASE-BASED BUILD MODEL

Development is organized into **explicit phases** (Phase 1, Phase 2, etc.).

Each phase follows the same lifecycle.

### 4.1 Phase Kickoff
At the start of each phase, a file is generated:

- `PHASE_X_FILELIST.md`

This file contains:
- the ordered list of files to be built or modified
- one file per step
- acceptance criteria for each file
- references back to sections of `master_build.md`

This file becomes the **authoritative checklist** for the phase.

---

### 4.2 Scaffolding Before Building
Before any file work begins:
- all required directories must exist
- all required files must exist at least as placeholders

This is enforced via the plan guard.

If a required path is missing, the phase **cannot proceed**.

---

### 4.3 One-File-At-A-Time Rule
Files are built **one at a time**, in the order listed in `PHASE_X_FILELIST.md`.

No skipping.  
No parallel edits.  
No “while we’re here” changes.

Each file must be completed, verified, and committed before moving on.

---

## 5. FILE AUTHORING RULES (CRITICAL)

### 5.1 No Snippets — Ever
- When creating a new file, the **entire file** is written at once.
- Partial files, snippets, diffs, or patches are not allowed.

### 5.2 Rewrites Require the Full Existing File
- If a file already exists and needs changes:
  - The current full file must be provided first.
  - The file is then rewritten **in full**.
- No inline edits.
- No patch-style responses.

This ensures clarity, traceability, and prevents accidental regression.

---

## 6. SYSTEM SELF-MONITORING

The system must be able to **audit itself** at any time.

### 6.1 Plan Guard
A plan guard script is used to:
- parse `master_build.md`
- extract required file and folder paths
- compare them to the actual filesystem
- report:
  - missing required paths (OFF-PLAN)
  - extra unplanned paths (DRIFT)

The guard must be run:
- at the start of each phase
- periodically during development
- at the end of each phase

The guard is **amoral**:
- it does not interpret intent
- it does not rewrite history
- it does not auto-fix drift by deleting files

---

### 6.2 Phase-Scoped Enforcement (Default in Phase 4+)
From Phase 4 onward:
- plan_guard is run **per phase** by default
- enforcement scope is limited to missing-path checks for that phase slice
- drift checks must not flag files planned in other phases as drift
- whole-repo audits are reserved for phase closeout or release checks

---

### 6.3 Legacy Handling (Phase 4+)
Files created prior to the strict epoch:
- may exist without failing a phase-scoped check
- are treated as **LEGACY_READONLY**
- may not be modified or extended unless explicitly claimed in the current phase plan

---

### 6.4 Runtime-Only Paths
Certain paths are **never plan-bound** and are ignored by plan_guard:

- `node_modules/`
- `.next/`
- `.turbo/`
- `.cache/`
- `.vercel/`
- `.netlify/`
- `.env`, `.env.*`
- OS artifacts (`.DS_Store`, `Thumbs.db`)
- Package manager lockfiles (policy unchanged)

Ignored paths are not drift — but they are also not valid substitutes for planned files.

---

### 6.5 Phase Snapshots
At the end of each phase:
- a manifest snapshot is saved
- this snapshot represents the “phase-complete” state
- future phases may be compared against prior snapshots

This creates a durable audit trail across the project lifecycle.

---

## 7. PHASE COMPLETION AND THREAD RESET

When a phase is complete:
1. All files in `PHASE_X_FILELIST.md` are checked off
2. The plan guard reports no missing required paths
3. Any drift is either justified and documented or removed
4. A snapshot is taken

Only then does development move to:
- a new phase
- a new working thread

Each phase is treated as a clean, deliberate build cycle.

---

## 8. OPERATIONAL END GOAL

The final goal of this system is:

> The developer can request a file, receive a complete file, paste it into the repo, and move on —  
> while the system itself guarantees correctness, alignment, and forward progress.

Human memory is not relied upon.  
Discipline is enforced by structure.

---

## 9. ENFORCEMENT

If a requested action violates these protocols:
- the action must pause
- the plan or protocol must be updated
- or the filesystem must be corrected

No silent exceptions.

These protocols are binding for all future work on this repository.

---

## 10. PHASE TIMING, VERSIONING, AND RELEASE ARTIFACTS

### 10.1 Phase End Timestamp (Required)
At the close of every phase, the project must record a **Phase End Time** in plain language.

- The Phase End Time will be provided by the project owner (user) at the moment the phase is declared complete.
- This timestamp must be written into:
  - `PHASE_X_FILELIST.md` (Phase End Time line at bottom)
  - and/or a central log file if one exists (optional, but recommended later)

No phase is considered “closed” until the Phase End Time is recorded.

---

## 11. CURSOR + GIT + NETLIFY WORKFLOW (AUTHORITATIVE)

### 11.1 Editing Workflow
The canonical build loop is:

1. A single file is produced (full file, no snippets).
2. The file is pasted into the correct location using Cursor.
3. Cursor saves the file in-place.
4. Cursor’s Git integration is used to commit changes.

This workflow is mandatory to keep the build deterministic and traceable.

### 11.2 Source Control as System Memory
Git is treated as the system’s history and enforcement layer.

- Work must be committed in a disciplined way.
- Commits should align to file completion and/or phase completion rules.

---

## 12. LOCAL DATABASE REQUIREMENT AND DATA BOUNDARIES

### 12.1 Local Database Must Run
The system must support running a **local database** during development and testing.

### 12.2 Financial Records Must Not Leave Local
Financial records (real donor/payment/financial data) must not be stored in any hosted database or third-party persistence layer.

- Hosted environments (Netlify or any remote services) must operate using:
  - non-sensitive demo data, seeded test data, or mocked data
  - environment-based configuration that prevents accidental persistence of financial records remotely

### 12.3 Pass-Through Architecture Requirement
The system must support a secure workflow where:
- development and testing can run locally against a local database
- hosted deployments can function without requiring production financial records
- configuration can switch safely between environments without risking data leakage

This is a hard boundary: real financial records remain local.

---

## 13. PHASE VERSIONING, TAGGING, AND ZIP ARCHIVES

### 13.1 Version After Every Phase
At the end of each phase:
- the repo is versioned (Git commit discipline + optional Git tag)
- and a ZIP archive is created as a phase artifact

### 13.2 ZIP Artifact Location (Outside Repo Root)
ZIP archives must be saved **outside** the repository root, at:
- `C:\dev\`

This prevents build artifacts from polluting the repo and avoids accidental commits of archives.

### 13.3 ZIP Naming Convention
Each phase ZIP should use a consistent naming format, for example:
- `campaign_compliance_phase-1_YYYY-MM-DD_HHMM.zip`

(Exact format may be adjusted later, but the phase number and timestamp are required.)
