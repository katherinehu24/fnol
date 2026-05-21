"use client";

import { Panel, DataRow, Pill } from "@/components/ui/primitives";
import type { Claim } from "@/lib/types";

type Report = NonNullable<Claim["policeReport"]>;

export function PoliceReportExtract({ report }: { report: Report }) {
  const confPct = Math.round(report.confidence * 100);
  const tone = confPct >= 90 ? "good" : confPct >= 75 ? "info" : "warn";
  return (
    <Panel
      title="Police report — extracted fields"
      subtitle={`${report.department} · ${report.reportNumber}`}
      actions={<Pill tone={tone}>Extract confidence {confPct}%</Pill>}
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-0">
        <DataRow label="Report #" value={report.reportNumber} mono />
        <DataRow
          label="At fault"
          value={
            report.atFault === "other_party"
              ? "Other party"
              : report.atFault === "claimant"
              ? "Claimant"
              : "Unclear / pending"
          }
        />
        <DataRow label="Department" value={report.department} />
        <DataRow label="Citation issued" value={report.citationIssued ? "Yes" : "No"} />
      </div>
      <div className="mt-2 px-2 py-2 bg-ink-800 border border-ink-700 rounded-sm">
        <div className="text-2xs uppercase tracking-wider text-ink-400 mb-1">Narrative summary</div>
        <div className="text-[12.5px] text-ink-100 leading-relaxed">{report.narrativeSummary}</div>
      </div>
    </Panel>
  );
}
