import Link from "next/link";

function Card({
  title,
  desc,
  href,
  cta,
}: {
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border bg-white p-5 shadow-sm hover:shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="mt-1 text-sm text-gray-600">{desc}</div>
        </div>
        <div className="shrink-0 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white">
          {cta}
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-5">
        <div className="text-xl font-semibold">
          Compliance Command Center
        </div>
        <div className="mt-1 text-sm text-gray-600">
          Import → Validate → Fix flags → Export SOS templates.
          Arkansas-only rules enforcement.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          title="Import Good Change Donations"
          desc="Upload the vendor spreadsheet (no headers). We map columns, unify contacts, flag missing fields, and store an audit trail."
          href="/imports/fundraising"
          cta="Start Wizard"
        />
        <Card
          title="Contributions"
          desc="Search, review flagged items, edit, and track per-contact totals over time."
          href="/contributions"
          cta="Open"
        />
        <Card
          title="Expenses"
          desc="Enter expenditures, analyze compliance fields, and prep for SOS upload."
          href="/expenses"
          cta="Open"
        />
        <Card
          title="Filing"
          desc="Run preflight checks, review errors, then export SOS Contributions/Expenditures CSV in the definitive schema."
          href="/filing"
          cta="Preflight"
        />
        <Card
          title="Candidate"
          desc="Ask questions in Rules-only mode (SOS docs only) or DB-only mode (your data only)."
          href="/candidate"
          cta="Ask"
        />
        <Card
          title="Settings"
          desc="Election metadata defaults, committee info, compliance thresholds, and vendor mappings."
          href="/settings"
          cta="Configure"
        />
      </div>
    </div>
  );
}
