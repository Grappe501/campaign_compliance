// apps/campaign_compliance/app/api/contributions/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import type { ContributionDraft } from "../../../../lib/sos-schema";
import { formatContributorName } from "../../../../lib/sos-schema";

function dateOnlyToDate(receivedAt: string): Date {
  return new Date(`${receivedAt}T00:00:00.000Z`);
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;

  const row = await prisma.campaignContribution.findUnique({
    where: { id },
  });

  if (!row) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, result: row });
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;

  let body: Partial<ContributionDraft>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Compute contributorName if name fields changed
  const maybeNameDraft: ContributionDraft = {
    contributorType: (body.contributorType || "INDIVIDUAL") as any,
    firstName: body.firstName ?? null,
    lastName: body.lastName ?? null,
    organizationName: body.organizationName ?? null,
    amountCents: Number.isFinite(body.amountCents as any) ? Math.max(0, Math.trunc(body.amountCents as any)) : 0,
    receivedAt: body.receivedAt || new Date().toISOString().slice(0, 10),
    paymentMethod: (body.paymentMethod || "UNKNOWN") as any,
    isInKind: Boolean(body.isInKind),
    isRefund: Boolean(body.isRefund),
  };

  const contributorName = formatContributorName(maybeNameDraft);
  const status = (body.status as any) || undefined;

  const updated = await prisma.campaignContribution.update({
    where: { id },
    data: {
      contributorType: body.contributorType as any,
      contributorName: contributorName || (body as any).contributorName || undefined,

      address1: body.address1 ?? undefined,
      address2: body.address2 ?? undefined,
      city: body.city ?? undefined,
      state: body.state ?? undefined,
      zip: body.zip ?? undefined,
      employer: body.employer ?? undefined,
      occupation: body.occupation ?? undefined,

      amountCents: typeof body.amountCents === "number" ? Math.max(0, Math.trunc(body.amountCents)) : undefined,
      receivedAt: body.receivedAt ? dateOnlyToDate(body.receivedAt) : undefined,

      paymentMethod: body.paymentMethod as any,
      checkNumber: body.checkNumber ?? undefined,

      isInKind: typeof body.isInKind === "boolean" ? body.isInKind : undefined,
      inKindDescription: body.inKindDescription ?? undefined,

      isRefund: typeof body.isRefund === "boolean" ? body.isRefund : undefined,

      memo: body.memo ?? undefined,

      status,
      // validationErrors will be set by validators in P2-06 (UI can also send it)
      validationErrors: (body as any).validationErrors ?? undefined,
    },
  });

  return NextResponse.json({ ok: true, updated });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;

  await prisma.campaignContribution.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
