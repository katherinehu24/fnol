"use client";

import { Panel, Pill } from "@/components/ui/primitives";
import type { Claim } from "@/lib/types";

const SEVERITY_TONE: Record<string, "good" | "warn" | "crit"> = {
  minor: "good",
  moderate: "warn",
  severe: "crit",
};

export function PhotosBlock({ claim }: { claim: Claim }) {
  if (claim.photos.length === 0) return null;

  // Summarize zones + severity counts — compact replacement for the 6-tile grid.
  const zoneSet = Array.from(new Set(claim.photos.map((p) => p.damageZone)));
  const sevCount: Record<string, number> = { minor: 0, moderate: 0, severe: 0 };
  claim.photos.forEach((p) => {
    sevCount[p.severity] = (sevCount[p.severity] ?? 0) + 1;
  });
  const worst = sevCount.severe > 0 ? "severe" : sevCount.moderate > 0 ? "moderate" : "minor";

  return (
    <Panel
      title="Damage photos · extracted"
      subtitle={`${claim.photos.length} images · zones identified · severity assessed`}
      actions={<Pill tone={SEVERITY_TONE[worst]}>{`worst: ${worst}`}</Pill>}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="data-label mb-1.5">Zones identified</div>
          <div className="flex flex-wrap gap-1.5">
            {zoneSet.map((z) => (
              <span
                key={z}
                className="text-[11.5px] text-ink-100 px-2 py-0.5 bg-ink-800 border border-ink-700 rounded-sm"
              >
                {z}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="data-label mb-1.5">Severity breakdown</div>
          <div className="space-y-1.5">
            {(["severe", "moderate", "minor"] as const).map((s) => {
              const count = sevCount[s] ?? 0;
              if (count === 0) return null;
              const pct = (count / claim.photos.length) * 100;
              const color =
                s === "severe" ? "bg-crit" : s === "moderate" ? "bg-amber" : "bg-ok";
              return (
                <div key={s} className="flex items-center gap-2 text-[12px]">
                  <span className="capitalize text-ink-200 w-16">{s}</span>
                  <div className="flex-1 h-1.5 bg-ink-700 rounded-sm overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="font-mono text-ink-200 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
}
