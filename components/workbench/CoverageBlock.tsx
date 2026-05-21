"use client";

import { Panel, Pill, IconDot } from "@/components/ui/primitives";
import { formatMoney } from "@/lib/format";
import type { Claim } from "@/lib/types";

export function CoverageBlock({ claim }: { claim: Claim }) {
  const { policy, coverageSummary } = claim;
  return (
    <Panel
      title="Coverage map"
      subtitle={`${coverageSummary.appliesTo.length} of ${policy.coverages.length} applies${coverageSummary.ambiguities.length ? " · ambiguity flagged" : ""}`}
      actions={
        coverageSummary.ambiguities.length > 0 ? (
          <Pill tone="warn">Manual interpretation required</Pill>
        ) : (
          <Pill tone="good">Clean</Pill>
        )
      }
    >
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="text-2xs uppercase tracking-wider text-ink-300">
            <th className="text-left font-medium py-1">Code</th>
            <th className="text-left font-medium py-1">Coverage</th>
            <th className="text-left font-medium py-1">Limit</th>
            <th className="text-left font-medium py-1">Deductible</th>
            <th className="text-right font-medium py-1">Applies</th>
          </tr>
        </thead>
        <tbody>
          {policy.coverages.map((c) => {
            const applies = coverageSummary.appliesTo.includes(c.code);
            return (
              <tr key={c.code} className="border-t border-ink-700/60">
                <td className="py-1.5 font-mono text-ink-200">{c.code}</td>
                <td className="py-1.5 text-ink-100">{c.label}</td>
                <td className="py-1.5 text-ink-200">{c.limit}</td>
                <td className="py-1.5 text-ink-200">{c.deductible ?? "—"}</td>
                <td className="py-1.5 text-right">
                  {applies ? (
                    <span className="inline-flex items-center gap-1.5 text-ok">
                      <IconDot tone="good" /> Applies
                    </span>
                  ) : (
                    <span className="text-ink-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {coverageSummary.ambiguities.length > 0 && (
        <div className="mt-2 px-2 py-2 bg-amber-900/30 border border-amber/30 rounded-sm">
          <div className="text-2xs uppercase tracking-wider text-amber mb-1">Coverage ambiguity</div>
          <ul className="text-[12px] text-ink-100 space-y-1 list-disc pl-4">
            {coverageSummary.ambiguities.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-2 flex items-baseline justify-between text-2xs text-ink-300">
        <span>Reserve estimate (Routine recommendation):</span>
        <span className="font-mono text-ink-100">{formatMoney(coverageSummary.reserveEstimate)}</span>
      </div>
    </Panel>
  );
}
