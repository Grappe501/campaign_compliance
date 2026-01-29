"use client";

import { useMemo, useState } from "react";

type PreviewRow = (string | number | null)[];
type PreviewResponse = {
  ok: boolean;
  filename?: string;
  rows?: PreviewRow[];
  rowCount?: number;
  colCount?: number;
  error?: string;
};

function formatCell(v: unknown) {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
  return String(v);
}

export default function ImportFundraisingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [busy, setBusy] = useState(false);

  const canPreview = !!file && !busy;

  const colHeaders = useMemo(() => {
    const cols = preview?.colCount ?? 0;
    return Array.from({ length: cols }, (_, i) => `Col ${i + 1}`);
  }, [preview?.colCount]);

  async function onPreview() {
    if (!file) return;

    setBusy(true);
    setPreview(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/imports/fundraising/preview", {
        method: "POST",
        body: form,
      });

      const data = (await res.json()) as PreviewResponse;
      setPreview(data);
    } catch (e: any) {
      setPreview({ ok: false, error: e?.message ?? "Preview failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-5">
        <div className="text-lg font-semibold">Import Wizard: Good Change</div>
        <div className="mt-1 text-sm text-gray-600">
          Upload vendor export (often has <b>no headers</b>). We’ll preview raw
          columns, then map them to Arkansas SOS contribution fields.
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 space-y-4">
        <div className="text-sm font-semibold">Step 1 — Upload file</div>

        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={onPreview}
            disabled={!canPreview}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Previewing…" : "Preview first rows"}
          </button>

          <div className="text-xs text-gray-500">
            Accepted: .xlsx / .csv. Nothing is saved to DB yet.
          </div>
        </div>

        {preview?.ok === false && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {preview.error ?? "Preview failed"}
          </div>
        )}

        {preview?.ok && preview.rows && (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-semibold">File:</span>{" "}
              {preview.filename ?? "uploaded file"}{" "}
              <span className="text-gray-500">
                • rows: {preview.rowCount} • cols: {preview.colCount}
              </span>
            </div>

            <div className="overflow-auto rounded-xl border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b px-3 py-2 text-left text-xs font-semibold text-gray-600">
                      #
                    </th>
                    {colHeaders.map((h) => (
                      <th
                        key={h}
                        className="border-b px-3 py-2 text-left text-xs font-semibold text-gray-600"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((r, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-gray-50">
                      <td className="border-b px-3 py-2 text-xs text-gray-500">
                        {idx + 1}
                      </td>
                      {colHeaders.map((_, c) => (
                        <td key={c} className="border-b px-3 py-2">
                          {formatCell(r[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-gray-500">
              Next step: pick which column is Email/Name/Amount/Date/etc, then we
              validate and convert to SOS schema.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
