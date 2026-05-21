"use client";

import { useEffect, useRef, useState } from "react";
import { Panel, Pill, IconDot } from "@/components/ui/primitives";
import { formatRelative, formatTime } from "@/lib/format";
import { NOW_ISO } from "@/lib/data";
import { useWorkbench } from "@/lib/store";
import type { Claim, AuditEntry } from "@/lib/types";

function actorTone(kind: AuditEntry["actorKind"]) {
  if (kind === "routine") return "info" as const;
  if (kind === "human") return "human" as const;
  return "neutral" as const;
}

function decisionTone(d?: AuditEntry["decision"]) {
  if (!d) return null;
  if (d === "automated") return "info" as const;
  if (d === "human_confirmed") return "good" as const;
  if (d === "human_override") return "warn" as const;
  if (d === "escalated") return "crit" as const;
  return "neutral" as const;
}

const DECISION_LABEL: Record<NonNullable<AuditEntry["decision"]>, string> = {
  automated: "Automated",
  human_confirmed: "Human confirmed",
  human_override: "Override",
  escalated: "Escalated",
};

export function ActivityTimeline({ claim }: { claim: Claim }) {
  const sorted = [...claim.activity].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
  const focusKey = useWorkbench((s) => s.audiTrailFocusKey);
  const ref = useRef<HTMLDivElement | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (focusKey === 0) return;
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 1400);
    return () => clearTimeout(t);
  }, [focusKey]);

  return (
    <div ref={ref}>
      <Panel
        title="Audit trail"
        subtitle={`${sorted.length} events · every action logged`}
        actions={<Pill tone="info">Audit-grade · exportable</Pill>}
        className={flash ? "ring-2 ring-accent transition-shadow" : ""}
      >
        <ol className="space-y-0">
          {sorted.map((entry) => {
            const tone = actorTone(entry.actorKind);
            const dt = decisionTone(entry.decision);
            return (
              <li key={entry.id} className="flex gap-3 py-1.5 border-b border-ink-700/60 last:border-b-0">
                <div className="font-mono text-[11px] text-ink-400 pt-0.5 w-16 shrink-0">
                  {formatTime(entry.ts)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12.5px] text-ink-50">{entry.action}</span>
                    <Pill tone={tone}>
                      {entry.actorKind === "routine" ? "Routine" : entry.actorKind === "human" ? "Human" : "System"}
                    </Pill>
                    {dt && entry.decision && <Pill tone={dt}>{DECISION_LABEL[entry.decision]}</Pill>}
                  </div>
                  <div className="text-2xs text-ink-300 mt-0.5">
                    <span className="text-ink-200">{entry.actor}</span>
                    {entry.detail && <> · {entry.detail}</>}
                  </div>
                </div>
                <div className="text-2xs text-ink-400 pt-0.5 shrink-0 w-20 text-right">
                  {formatRelative(entry.ts, NOW_ISO)}
                </div>
              </li>
            );
          })}
        </ol>
      </Panel>
    </div>
  );
}
