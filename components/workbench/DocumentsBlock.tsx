"use client";

import { Panel, Pill } from "@/components/ui/primitives";
import { formatRelative } from "@/lib/format";
import { NOW_ISO } from "@/lib/data";
import type { Claim, DocumentItem } from "@/lib/types";

const TYPE_LABEL: Record<DocumentItem["type"], string> = {
  police_report: "Police report",
  photos: "Damage photos",
  policy_declaration: "Policy declarations",
  loss_statement: "Loss statement",
  estimate: "Repair estimate",
  drivers_license: "Driver's license",
  tow_invoice: "Tow invoice",
};

const STATUS_TONE: Record<DocumentItem["status"], "good" | "warn" | "crit" | "info"> = {
  received: "info",
  extracted: "good",
  low_confidence: "warn",
  missing: "crit",
};

const STATUS_LABEL: Record<DocumentItem["status"], string> = {
  received: "Received",
  extracted: "Reviewed",
  low_confidence: "Needs review",
  missing: "Missing",
};

export function DocumentsBlock({ claim }: { claim: Claim }) {
  const missingCount = claim.documents.filter((d) => d.status === "missing").length;
  const total = claim.documents.length;
  const extracted = claim.documents.filter((d) => d.status === "extracted").length;
  return (
    <Panel
      title="Intake package"
      subtitle={`${extracted} of ${total} extracted${missingCount ? ` · ${missingCount} missing` : ""}`}
      actions={
        missingCount > 0 ? (
          <Pill tone="warn">Intake recovery required</Pill>
        ) : (
          <Pill tone="good">Pre-assembled · ready</Pill>
        )
      }
      bodyClassName="p-0"
    >
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="text-2xs uppercase tracking-wider text-ink-300">
            <th className="text-left font-medium px-3 py-1.5">Document</th>
            <th className="text-left font-medium px-2 py-1.5">Status</th>
            <th className="text-left font-medium px-2 py-1.5">Received</th>
            <th className="text-left font-medium px-2 py-1.5">Pages</th>
            <th className="text-right font-medium px-3 py-1.5"> </th>
          </tr>
        </thead>
        <tbody>
          {claim.documents.map((d) => (
            <tr key={d.id} className="border-t border-ink-700/60">
              <td className="px-3 py-1.5">
                <div className="text-ink-100">{d.label}</div>
                <div className="text-2xs text-ink-400">{TYPE_LABEL[d.type]}</div>
              </td>
              <td className="px-2 py-1.5">
                <Pill tone={STATUS_TONE[d.status]}>{STATUS_LABEL[d.status]}</Pill>
              </td>
              <td className="px-2 py-1.5 text-ink-300">
                {d.receivedAt ? formatRelative(d.receivedAt, NOW_ISO) : "—"}
              </td>
              <td className="px-2 py-1.5 font-mono text-ink-300">{d.pageCount ?? "—"}</td>
              <td className="px-3 py-1.5 text-right">
                {d.status === "missing" ? (
                  <button className="btn btn-warn">Request</button>
                ) : (
                  <button className="text-2xs text-ink-300 hover:text-ink-100 uppercase tracking-wider">View</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
