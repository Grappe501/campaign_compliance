@'
/**
 * P2-03 — Dropdown sources (single source of truth)
 * Rule: UI dropdowns pull ONLY from this file.
 * These are MVP values until official SOS enumerations are ingested.
 */

export const DROPDOWNS = {
  contributionType: [
    "Cash",
    "In-Kind",
  ],
  contributorType: [
    "Individual",
    "Organization",
  ],
  electionType: [
    "Primary",
    "General",
    "Runoff",
    "Special",
  ],
  expenditureType: [
    "Reimbursement",
    "Payment",
    "In-Kind",
  ],
  expenditureCategory: [
    "Advertising",
    "Food",
    "Office",
    "Travel",
    "Utilities",
    "Other",
  ],
  payeeType: [
    "PERSON",
    "ORGANIZATION",
  ],
} as const;
'@ | Set-Content -Encoding UTF8 "apps/campaign_compliance/lib/dropdowns.ts"
