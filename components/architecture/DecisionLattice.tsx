"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkbench } from "@/lib/store";
import {
  NODES,
  SAMPLE_PATHS,
  STAGE_KICKER,
  STAGE_LABEL,
  STAGE_NUMBER,
  type LatticeNode,
  type Stage,
} from "@/lib/architecture";

const STAGES: Stage[] = ["channel", "validation", "confidence", "routing", "outcome"];

const HITL_DOT: Record<LatticeNode["hitl"], string> = {
  automated: "bg-ok",
  review: "bg-amber",
  escalated: "bg-crit",
};

export function DecisionLattice() {
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const router = useRouter();
  const select = useWorkbench((s) => s.select);

  const activePath = SAMPLE_PATHS.find((p) => p.id === activePathId);
  const onPath = new Set(activePath?.nodes ?? []);

  function openClaimInWorkbench() {
    if (!activePath) return;
    select(activePath.claimId);
    router.push("/workbench");
  }

  return (
    <section>
      {/* Path trace toolbar */}
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-2xs uppercase tracking-[0.18em] text-accent">Trace a claim</div>
          <div className="text-[12.5px] text-ink-300 mt-1">
            Light up the routing path for one representative claim.
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {SAMPLE_PATHS.map((p) => {
            const active = p.id === activePathId;
            const toneCls =
              p.tone === "good"
                ? active
                  ? "bg-ok-900/60 border-ok text-ink-50"
                  : "border-ok/40 text-ok"
                : p.tone === "warn"
                ? active
                  ? "bg-amber-900/60 border-amber text-ink-50"
                  : "border-amber/40 text-amber"
                : active
                ? "bg-crit-900/60 border-crit text-ink-50"
                : "border-crit/40 text-crit";
            return (
              <button
                key={p.id}
                onClick={() => setActivePathId(active ? null : p.id)}
                className={`btn h-7 px-2.5 bg-ink-800 ${toneCls}`}
                title={p.label}
              >
                <span className="font-mono text-[11px] opacity-70">{p.claimId.split("-").slice(-1)[0]}</span>
                <span className="ml-1.5">{p.shortLabel}</span>
              </button>
            );
          })}
          <button
            onClick={() => setActivePathId(null)}
            disabled={!activePathId}
            className="btn btn-ghost h-7 px-2.5"
          >
            Clear
          </button>
        </div>
      </div>

      {/* The lattice */}
      <div
        className="grid gap-x-8 gap-y-0 relative"
        style={{ gridTemplateColumns: `repeat(${STAGES.length}, minmax(0, 1fr))` }}
      >
        {STAGES.map((stage, i) => (
          <div key={stage} className="pb-4 border-b border-ink-700">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-mono text-2xs text-ink-400">{STAGE_NUMBER[stage]}</span>
              <span className="text-2xs uppercase tracking-[0.16em] text-ink-100 font-medium">
                {STAGE_LABEL[stage]}
              </span>
            </div>
            <div className="text-2xs text-ink-400">{STAGE_KICKER[stage]}</div>
          </div>
        ))}

        {STAGES.map((stage) => (
          <div key={stage} className="pt-5 pr-3 space-y-4">
            {NODES.filter((n) => n.stage === stage).map((n) => {
              const dim = activePathId !== null && !onPath.has(n.id);
              const lit = activePathId !== null && onPath.has(n.id);
              return (
                <div
                  key={n.id}
                  className={`transition-opacity ${dim ? "opacity-25" : "opacity-100"}`}
                >
                  <div
                    className={`flex items-start gap-2.5 ${
                      lit ? "" : ""
                    }`}
                  >
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${HITL_DOT[n.hitl]}`} />
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-[13px] leading-tight ${
                          lit ? "text-ink-50 font-medium" : "text-ink-100"
                        }`}
                      >
                        {n.label}
                        {lit && (
                          <span className="ml-2 inline-block h-1 w-6 bg-accent align-middle rounded-sm" />
                        )}
                      </div>
                      {n.sub && (
                        <div className="text-2xs text-ink-400 mt-0.5 leading-tight">{n.sub}</div>
                      )}
                      {n.metric && (
                        <div className="text-2xs font-mono text-ink-300 mt-1">{n.metric}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend + path detail strip */}
      <div className="mt-8 pt-4 border-t border-ink-700 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-2xs text-ink-300">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Automated
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber" /> Human review
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-crit" /> Halt · escalation
          </span>
        </div>
        {activePath && (
          <div className="flex items-center gap-3 text-2xs">
            <span className="text-ink-400">Path:</span>
            <span className="font-mono text-accent">{activePath.claimId}</span>
            <span className="text-ink-300">{activePath.label}</span>
            <button onClick={openClaimInWorkbench} className="btn btn-primary h-7 px-2.5">
              Open in workbench →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
