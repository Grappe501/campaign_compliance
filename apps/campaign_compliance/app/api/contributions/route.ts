// apps/campaign_compliance/app/api/contributions/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import type { ContributionDraft } from "../../../lib/sos-schema";
import { formatContributorName } from "../../../lib/sos-schema";

function dateOnlyToDate(receivedAt: string): Date {
  // receivedAt is YYYY-MM-DD
  return new Date(`${receivedAt}T00:00:00.000Z`);
}

function randomToken(len = 10) {
  return Math.random().toString(36).slice(2, 2 + len).toUpperCase();
}

async function generateExternalContributionId(): Promise<string> {
  // Format: C-YYYYMMDD-XXXXXXXXXX
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const prefix = `C-${y}${m}${day}-`;

  // Try a few times to avoid unique collisions
  for (let i = 0; i < 6; i++) {
    const candidate = `${prefix}${randomToken(10)}`;
    const existing = await prisma.campaignContribution.findUnique({
      where: { externalContributionId: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  // Extremely unlikely; fallback to timestamp
  return `${prefix}${Date.now()}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const take = Math.min(parseInt(url.searchParams.get("take") || "25", 10) || 25, 100);

  const rows = await prisma.campaignContribution.findMany({
    orderBy: [{ receivedAt: "desc" }, { createdAt: "desc" }],
    take,
    select: {
      id: true,
      externalContributionId: true,
      contributorName: true,
      contributorType: true,
      amountCents: true,
      receivedAt: true,
      paymentMethod: true,
      status: true,
      isInKind: true,
      isRefund: true,
      validationErrors: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ ok: true, results: rows });
}

export async function POST(req: Request) {
  let body: Partial<ContributionDraft>;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // minimal defaults (wizard can PATCH later)
  const contributorType = (body.contributorType || "INDIVIDUAL") as any;
  const paymentMethod = (body.paymentMethod || "UNKNOWN") as any;

  const receivedAt = body.receivedAt || new Date().toISOString().slice(0, 10);
  const amountCents = Number.isFinite(body.amountCents as any) ? Math.max(0, Math.trunc(body.amountCents as any)) : 0;

  const draft: ContributionDraft = {
    contributorType,
    firstName: body.firstName ?? null,
    lastName: body.lastName ?? null,
    organizationName: body.organizationName ?? null,

    email: body.email ?? null,
    phone: body.phone ?? null,

    address1: body.address1 ?? null,
    address2: body.address2 ?? null,
    city: body.city ?? null,
    state: body.state ?? null,
    zip: body.zip ?? null,

    employer: body.employer ?? null,
    occupation: body.occupation ?? null,

    amountCents,
    receivedAt,

    paymentMethod,
    checkNumber: body.checkNumber ?? null,

    isInKind: Boolean(body.isInKind),
    inKindDescription: body.inKindDescription ?? null,

    isRefund: Boolean(body.isRefund),
    memo: body.memo ?? null,
  };

  const externalContributionId = await generateExternalContributionId();
  const contributorName = formatContributorName(draft) || (body as any).contributorName || null;

  const created = await prisma.campaignContribution.create({
    data: {
      externalContributionId,
      contributorType: draft.contributorType,
      contributorName,

      address1: draft.address1,
      address2: draft.address2,
      city: draft.city,
      state: draft.state,
      zip: draft.zip,
      employer: draft.employer,
      occupation: draft.occupation,

      amountCents: draft.amountCents,
      receivedAt: dateOnlyToDate(draft.receivedAt),

      paymentMethod: draft.paymentMethod,
      checkNumber: draft.checkNumber,
      isInKind: draft.isInKind,
      inKindDescription: draft.inKindDescription,
      isRefund: draft.isRefund,

      memo: draft.memo,

      status: "DRAFT",
      validationErrors: [],
    },
    select: {
      id: true,
      externalContributionId: true,
      status: true,
    },
  });

  return NextResponse.json({ ok: true, created }, { status: 201 });
}
