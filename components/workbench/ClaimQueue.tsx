"use client";

import { useState } from "react";
import { useWorkbench } from "@/lib/store";
import { QUEUE_BUCKETS, QUEUE_PADDING } from "@/lib/data";
import { Pill, IconDot } from "@/components/ui/primitives";
import { formatAge, formatMoney } from "@/lib/format";
import type { ClaimState } from "@/lib/types";

const STATE_LABEL: Record<ClaimState, string> = {
  ready_to_assign: "Ready",
  missing_documents: "Intake recovery",
  coverage_review: "Coverage",
  siu_escalation: "SIU",
  complex_loss: "Complex",
  assigned: "Assigned",
  in_progress: "In progress",
};

const STATE_TONE: Record<ClaimState, "good" | "warn" | "crit" | "info" | "neutral"> = {
  ready_to_assign: "good",
  missing_documents: "warn",
  coverage_review: "info",
  siu_escalation: "crit",
  complex_loss: "warn",
  assigned: "neutral",
  in_progress: "neutral",
};

export function ClaimQueue() {
  const { claims, selectedClaimId, select } = useWorkbench();
  const [bucket, setBucket] = useState<ClaimState | "all">("all");

  // merge real claims (rich) with queue padding (shallow)
  const allRows: Array<{
    id: string;
    state: ClaimState;
    claimant: string;
    lossType: string;
    reserve: number;
    fnolMin: number;
    confidence: number;
    routing: string;
    rich: boolean;
  }> = [
    ...claims.map((c) => ({
      id: c.id,
      state: c.state,
      claimant: c.claimant.name,
      lossType: c.loss.type.replace("_", " "),
      reserve: c.coverageSummary.reserveEstimate,
      fnolMin: c.fnolMinutes,
      confidence: c.routing.confidence,
      routing: c.routing.assigneeName ?? c.routing.decision.replace("_", " "),
      rich: true,
    })),
    ...QUEUE_PADDING.map((p) => ({ ...p, rich: false })),
  ];

  const filtered = bucket === "all" ? allRows : allRows.filter((r) => r.state === bucket);

  return (
    <div className="h-full flex flex-col bg-ink-850 border-r border-ink-700">
      <div className="px-3 py-2 border-b border-ink-700">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[13px] font-medium text-ink-50">Adjuster queue</div>
            <div className="text-2xs text-ink-400">Auto PD · all states · live</div>
          </div>
          <div className="font-mono text-2xs text-ink-300">{allRows.length} of 296</div>
        </div>
        <div className="grid grid-cols-3 gap-1 mb-2">
          <button
            onClick={() => setBucket("all")}
            className={`px-2 py-1 text-2xs uppercase tracking-wider border rounded-sm ${
              bucket === "all"
                ? "bg-ink-700 border-ink-500 text-ink-50"
                : "bg-ink-800 border-ink-700 text-ink-300 hover:text-ink-100"
            }`}
          >
            All
          </button>
          {QUEUE_BUCKETS.slice(0, 5).map((b) => (
            <button
              key={b.state}
              onClick={() => setBucket(b.state)}
              className={`px-2 py-1 text-2xs uppercase tracking-wider border rounded-sm flex items-center justify-between gap-1 ${
                bucket === b.state
                  ? "bg-ink-700 border-ink-500 text-ink-50"
                  : "bg-ink-800 border-ink-700 text-ink-300 hover:text-ink-100"
              }`}
              title={`${b.count} claims · p90 age ${formatAge(b.agingP90Min)}`}
            >
              <span className="truncate">{b.label.split(" ")[0]}</span>
              <span className="font-mono">{b.count}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-2xs text-ink-400">
          <input
            placeholder="Filter by claim ID, claimant, policy"
            className="flex-1 bg-ink-900 border border-ink-700 rounded-sm px-2 py-1 text-[12px] placeholder-ink-400 text-ink-100 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-[12px]">
          <thead className="sticky top-0 bg-ink-850 z-10">
            <tr className="text-ink-300 text-2xs uppercase tracking-wider">
              <th className="text-left font-medium px-3 py-1.5 border-b border-ink-700">Claim</th>
              <th className="text-left font-medium px-1 py-1.5 border-b border-ink-700">State</th>
              <th className="text-right font-medium px-1 py-1.5 border-b border-ink-700">Conf</th>
              <th className="text-right font-medium px-3 py-1.5 border-b border-ink-700">Age</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const selected = row.id === selectedClaimId && row.rich;
              const passing = row.confidence >= 0.85;
              return (
                <tr
                  key={row.id}
                  onClick={() => row.rich && select(row.id)}
                  className={`cursor-pointer border-b border-ink-700/60 ${
                    selected
                      ? "bg-accent/10 border-l-2 border-l-accent"
                      : row.rich
                      ? "hover:bg-ink-800"
                      : "opacity-60 cursor-default"
                  }`}
                >
                  <td className="px-3 py-2 align-top">
                    <div className="font-mono text-[11.5px] text-ink-100">{row.id}</div>
                    <div className="text-2xs text-ink-300 truncate max-w-[180px]">
                      {row.claimant} · {row.lossType} · {formatMoney(row.reserve)}
                    </div>
                  </td>
                  <td className="px-1 py-2 align-top">
                    <Pill tone={STATE_TONE[row.state]}>{STATE_LABEL[row.state]}</Pill>
                  </td>
                  <td className="px-1 py-2 align-top text-right">
                    <div className={`font-mono text-[11.5px] ${passing ? "text-ok" : "text-amber"}`}>
                      {Math.round(row.confidence * 100)}%
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top text-right">
                    <div className="font-mono text-[11.5px] text-ink-200">{formatAge(row.fnolMin)}</div>
                    <div className="text-2xs text-ink-400 truncate max-w-[110px]">{row.routing}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-ink-700 px-3 py-2 text-2xs text-ink-400 flex items-center justify-between">
        <span>SLA risk: <span className="text-amber">2.4%</span></span>
        <span>p50 age <span className="font-mono text-ink-100">26m</span></span>
        <span className="flex items-center gap-1.5"><IconDot tone="good" /> Live</span>
      </div>
    </div>
  );
}
