"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Panel, Pill, Stat, IconDot } from "@/components/ui/primitives";
import { ADJUSTERS, EXCEPTIONS, OPS_METRICS, QUEUE_BUCKETS } from "@/lib/data";
import { useWorkbench } from "@/lib/store";
import { formatAge, formatMoney } from "@/lib/format";

type DrillView = null | "sla" | "exceptions" | "board" | "sample";

export default function OperationsPage() {
  const [drill, setDrill] = useState<DrillView>(null);
  const router = useRouter();
  const select = useWorkbench((s) => s.select);

  function openSampleClaim() {
    select("CLM-2026-0451780");
    router.push("/workbench");
  }

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-76px)] overflow-y-auto">
      {/* Board-ready banner */}
      <div className="panel bg-gradient-to-r from-accent/15 via-ink-800 to-ink-800 border-accent/30 px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xs uppercase tracking-[0.18em] text-accent">Board-ready takeaway · Week 4 of 12</div>
            <div className="text-[19px] text-ink-50 mt-1 leading-tight max-w-[1000px]">
              FNOL-to-assignment reduced from <span className="font-mono text-accent">3h 01m</span> to{" "}
              <span className="font-mono text-ok">14m</span> while preserving human review, override, and audit controls.
            </div>
            <div className="text-2xs text-ink-300 mt-1">
              2,346 claims processed since cutover · backlog clearing 72/day net · zero silent reroutes.
            </div>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <button onClick={() => setDrill("board")} className="btn btn-primary h-8 px-3">
              View board summary
            </button>
            <button onClick={openSampleClaim} className="btn btn-ghost h-8 px-3">
              Drill into a claim
            </button>
          </div>
        </div>
      </div>

      {/* Page sub-header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xs text-ink-400 uppercase tracking-wider">SVP Claims Operations · Maria Chen</div>
          <h1 className="text-[20px] font-medium text-ink-50">Operations control · Auto PD FNOL intake</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xs text-ink-400 uppercase tracking-wider">Inflow last 24h</div>
            <div className="font-mono text-[16px] text-ink-50">1,640</div>
          </div>
          <div className="h-8 w-px bg-ink-700" />
          <div className="text-right">
            <div className="text-2xs text-ink-400 uppercase tracking-wider">Clear rate last 24h</div>
            <div className="font-mono text-[16px] text-ok">1,712</div>
          </div>
          <div className="h-8 w-px bg-ink-700" />
          <Pill tone="good">Backlog clearing</Pill>
        </div>
      </div>

      {/* Top metrics row */}
      <div className="grid grid-cols-6 gap-3">
        {OPS_METRICS.map((m) => (
          <Stat key={m.label} label={m.label} value={m.value} delta={m.delta} intent={m.intent ?? "neutral"} sub={m.sub} />
        ))}
      </div>

      {/* Queue state + bottleneck */}
      <div className="grid grid-cols-3 gap-3">
        <Panel
          title="Queue state · live"
          subtitle="all Auto PD intakes"
          className="col-span-2"
          actions={
            <button onClick={() => setDrill("sla")} className="btn btn-ghost h-7 px-2 text-2xs">
              View SLA risk queue
            </button>
          }
        >
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-2xs uppercase tracking-wider text-ink-300">
                <th className="text-left font-medium py-1.5">Bucket</th>
                <th className="text-right font-medium py-1.5">Count</th>
                <th className="text-right font-medium py-1.5">p50 age</th>
                <th className="text-right font-medium py-1.5">p90 age</th>
                <th className="text-right font-medium py-1.5">SLA risk</th>
                <th className="text-left font-medium py-1.5 pl-4">Movement (24h)</th>
              </tr>
            </thead>
            <tbody>
              {QUEUE_BUCKETS.map((b) => {
                const risky = b.slaRisk >= 0.25;
                const bars = movementBars(b.state);
                return (
                  <tr key={b.state} className="border-t border-ink-700/60">
                    <td className="py-2 text-ink-100">{b.label}</td>
                    <td className="py-2 text-right font-mono text-ink-100">{b.count}</td>
                    <td className="py-2 text-right font-mono text-ink-200">{formatAge(b.agingP50Min)}</td>
                    <td className="py-2 text-right font-mono text-ink-200">{formatAge(b.agingP90Min)}</td>
                    <td className="py-2 text-right">
                      <span className={`font-mono ${risky ? "text-amber" : "text-ink-200"}`}>
                        {Math.round(b.slaRisk * 100)}%
                      </span>
                    </td>
                    <td className="py-2 pl-4">
                      <Sparkline values={bars} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        <Panel title="Active bottleneck" actions={<Pill tone="warn">Attention</Pill>}>
          <div className="space-y-3">
            <div>
              <div className="data-label">Queue</div>
              <div className="text-[14px] text-ink-50">Intake recovery · missing docs</div>
              <div className="text-2xs text-ink-300">64 open · p90 age 2h 22m</div>
            </div>
            <div>
              <div className="data-label">Driver</div>
              <div className="text-[12.5px] text-ink-100">
                SMS provider latency elevated. Outbound document requests landing p95 4.1s
                vs. baseline 1.3s.
              </div>
            </div>
            <div>
              <div className="data-label">Recommended action</div>
              <ul className="text-[12.5px] text-ink-100 space-y-1 list-disc pl-4">
                <li>Failover Intake Recovery Routine to secondary SMS carrier (one-click).</li>
                <li>Shift 2 FTE from Fast Track A to Intake Recovery for 2h.</li>
              </ul>
            </div>
            <button className="btn btn-primary w-full">Apply recommended intervention</button>
          </div>
        </Panel>
      </div>

      {/* Exceptions + staffing */}
      <div className="grid grid-cols-3 gap-3">
        <Panel
          title="Workflow exceptions · open"
          subtitle={`${EXCEPTIONS.length} open · routed to humans`}
          className="col-span-2"
          actions={
            <button onClick={() => setDrill("exceptions")} className="btn btn-ghost h-7 px-2 text-2xs">
              View exception drivers
            </button>
          }
        >
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-2xs uppercase tracking-wider text-ink-300">
                <th className="text-left font-medium py-1.5">Claim</th>
                <th className="text-left font-medium py-1.5">Category</th>
                <th className="text-left font-medium py-1.5">Detail</th>
                <th className="text-left font-medium py-1.5">Owner</th>
                <th className="text-right font-medium py-1.5">Age</th>
              </tr>
            </thead>
            <tbody>
              {EXCEPTIONS.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => {
                    select(e.claimId);
                    router.push("/workbench");
                  }}
                  className="border-t border-ink-700/60 hover:bg-ink-800 cursor-pointer"
                  title="Open in workbench"
                >
                  <td className="py-1.5 font-mono text-[11.5px] text-accent">{e.claimId}</td>
                  <td className="py-1.5">
                    <Pill tone={categoryTone(e.category)}>{categoryLabel(e.category)}</Pill>
                  </td>
                  <td className="py-1.5 text-ink-200 max-w-[360px]">{e.detail}</td>
                  <td className="py-1.5 text-ink-100">{e.owner}</td>
                  <td className="py-1.5 text-right font-mono text-ink-200">{formatAge(e.ageMin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Adjuster load · Auto PD" subtitle="capacity vs. open">
          <div className="space-y-2">
            {ADJUSTERS.map((a) => {
              const pct = (a.load / a.capacity) * 100;
              const tone = pct >= 90 ? "crit" : pct >= 75 ? "warn" : "good";
              return (
                <div key={a.id}>
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="text-[12.5px] text-ink-100">
                      {a.name}{" "}
                      <span className="text-ink-400 text-2xs">
                        · {a.tier.replace("_", " ")}
                      </span>
                    </div>
                    <div className="font-mono text-[11.5px] text-ink-200">
                      {a.load}/{a.capacity}
                    </div>
                  </div>
                  <div className="h-1 bg-ink-700 rounded-sm overflow-hidden">
                    <div
                      className={`h-full ${
                        tone === "crit" ? "bg-crit" : tone === "warn" ? "bg-amber" : "bg-ok"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Deployment narrative — board-defensible */}
      <Panel title="Deployment narrative" subtitle="board-defensible · week 4 of 12">
        <div className="grid grid-cols-3 gap-4">
          <Narrative
            heading="Operational movement"
            kicker="Cycle time down 92%"
            body="FNOL → first-adjuster-action collapsed from 3h 01m baseline to 14m median. Throughput up; backlog clearing 72 claims/day net against 1,640/day inflow."
          />
          <Narrative
            heading="Workflow quality"
            kicker="6.8% override · 3.1% reroute"
            body="Adjuster overrides inside the 5–10% SLA band. Reroutes down 1.9 pts as Routine learns from override telemetry. No silent reroutes — every event audited."
          />
          <Narrative
            heading="Governance posture"
            kicker="100% audit coverage"
            body="Every routing decision, override, and escalation captured with actor, timestamp, and rationale. SIU referrals require written justification. Compliance reviews override log weekly."
          />
        </div>
      </Panel>

      <div className="text-2xs text-ink-400 pb-2 flex items-center gap-2">
        <IconDot tone="info" /> Data refreshes every 30s. SLA risk derived from p90 age vs. queue-specific SLA. Operations export available via ClaimCenter API.
      </div>

      {drill && <DrillModal view={drill} onClose={() => setDrill(null)} onOpenClaim={openSampleClaim} />}
    </div>
  );
}

function categoryLabel(c: string) {
  if (c === "missing_doc") return "Missing doc";
  if (c === "coverage_ambiguity") return "Coverage";
  if (c === "siu_indicator") return "SIU";
  if (c === "complex_loss") return "Complex";
  return "Third party";
}

function categoryTone(c: string): "good" | "warn" | "crit" | "info" {
  if (c === "missing_doc") return "warn";
  if (c === "coverage_ambiguity") return "info";
  if (c === "siu_indicator") return "crit";
  if (c === "complex_loss") return "warn";
  return "info";
}

function movementBars(state: string): number[] {
  const map: Record<string, number[]> = {
    ready_to_assign: [62, 71, 58, 84, 79, 92, 88, 96, 110, 118, 124, 135],
    missing_documents: [22, 28, 31, 33, 36, 38, 42, 47, 55, 60, 62, 64],
    coverage_review: [18, 17, 19, 20, 21, 23, 22, 24, 22, 23, 22, 22],
    siu_escalation: [6, 6, 7, 8, 9, 9, 10, 10, 9, 9, 9, 9],
    complex_loss: [11, 12, 13, 14, 13, 14, 14, 15, 14, 14, 14, 14],
  };
  return map[state] ?? [];
}

function Sparkline({ values }: { values: number[] }) {
  if (!values.length) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 120;
  const h = 22;
  const step = w / (values.length - 1);
  const points = values
    .map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 2) - 1}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="block">
      <polyline points={points} fill="none" stroke="#3d7eff" strokeWidth="1.25" />
      <circle cx={w} cy={h - ((values[values.length - 1] - min) / range) * (h - 2) - 1} r={2} fill="#3d7eff" />
    </svg>
  );
}

function Narrative({ heading, kicker, body }: { heading: string; kicker: string; body: string }) {
  return (
    <div className="px-3 py-3 bg-ink-800 border border-ink-700 rounded-sm">
      <div className="data-label">{heading}</div>
      <div className="text-[16px] font-medium text-ink-50 leading-tight mt-1">{kicker}</div>
      <div className="text-[12.5px] text-ink-200 mt-1.5 leading-relaxed">{body}</div>
    </div>
  );
}

// ─── Drill-in modals ─────────────────────────────────────────────────────

function DrillModal({
  view,
  onClose,
  onOpenClaim,
}: {
  view: DrillView;
  onClose: () => void;
  onOpenClaim: () => void;
}) {
  if (!view) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-6" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="panel bg-ink-850 border-ink-600 w-[min(960px,100%)] max-h-[88vh] overflow-y-auto shadow-2xl"
      >
        <div className="px-4 py-3 border-b border-ink-700 flex items-center justify-between">
          <div>
            <div className="text-2xs uppercase tracking-[0.16em] text-accent">{drillKicker(view)}</div>
            <div className="text-[16px] text-ink-50 mt-0.5">{drillTitle(view)}</div>
          </div>
          <button onClick={onClose} className="text-ink-300 hover:text-ink-100 text-[18px] leading-none">
            ×
          </button>
        </div>
        <div className="p-4">
          {view === "sla" && <SlaView />}
          {view === "exceptions" && <ExceptionsView />}
          {view === "board" && <BoardView />}
          {view === "sample" && <SampleClaimView onOpenClaim={onOpenClaim} />}
        </div>
      </div>
    </div>
  );
}

function drillKicker(v: DrillView) {
  if (v === "sla") return "SLA risk · last 24h";
  if (v === "exceptions") return "Exception drivers · last 7 days";
  if (v === "board") return "Board summary · week 4 of 12";
  return "Sample claim";
}
function drillTitle(v: DrillView) {
  if (v === "sla") return "Claims at risk of breaching the SLA window";
  if (v === "exceptions") return "What is pulling claims out of the auto-route path";
  if (v === "board") return "FNOL Intake deployment — operating snapshot";
  return "Walk one claim end-to-end";
}

function SlaView() {
  const rows = [
    { id: "CLM-2026-0451814", bucket: "Intake recovery", age: "1h 22m", sla: "4h", risk: 0.31, owner: "Intake Recovery" },
    { id: "CLM-2026-0451820", bucket: "Intake recovery", age: "44m", sla: "4h", risk: 0.18, owner: "Intake Recovery" },
    { id: "CLM-2026-0451780", bucket: "SIU escalation", age: "3h 36m", sla: "24h", risk: 0.22, owner: "P. Iyer" },
    { id: "CLM-2026-0451756", bucket: "Complex loss", age: "5h 12m", sla: "12h", risk: 0.46, owner: "J. Forrester" },
    { id: "CLM-2026-0451816", bucket: "Complex loss", age: "3h 16m", sla: "12h", risk: 0.32, owner: "S. Kowalski" },
    { id: "CLM-2026-0451802", bucket: "Coverage review", age: "2h 04m", sla: "8h", risk: 0.18, owner: "S. Kowalski" },
  ];
  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-ink-200">
        Six claims trending toward SLA breach. Routine-side mitigations already running (outbound recovery, SMS retry) — the items below are the ones requiring supervisor attention.
      </p>
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="text-2xs uppercase tracking-wider text-ink-300">
            <th className="text-left font-medium py-1.5">Claim</th>
            <th className="text-left font-medium py-1.5">Bucket</th>
            <th className="text-right font-medium py-1.5">Age</th>
            <th className="text-right font-medium py-1.5">SLA</th>
            <th className="text-right font-medium py-1.5">Risk</th>
            <th className="text-left font-medium py-1.5 pl-4">Owner</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-ink-700/60">
              <td className="py-1.5 font-mono text-[11.5px] text-accent">{r.id}</td>
              <td className="py-1.5 text-ink-100">{r.bucket}</td>
              <td className="py-1.5 text-right font-mono text-ink-200">{r.age}</td>
              <td className="py-1.5 text-right font-mono text-ink-300">{r.sla}</td>
              <td className="py-1.5 text-right">
                <span className={`font-mono ${r.risk >= 0.3 ? "text-amber" : "text-ink-200"}`}>
                  {Math.round(r.risk * 100)}%
                </span>
              </td>
              <td className="py-1.5 pl-4 text-ink-100">{r.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-2xs text-ink-400">
        Source: ClaimCenter activity stream · refreshed every 30s.
      </div>
    </div>
  );
}

function ExceptionsView() {
  const drivers = [
    { driver: "Missing police report (state-specific statutes)", share: 0.34, owner: "Intake Recovery", trend: "down" },
    { driver: "Permissive-use coverage ambiguity (TX, CA)", share: 0.19, owner: "Senior review", trend: "flat" },
    { driver: "SIU indicators (policy age + photometric)", share: 0.14, owner: "SIU desk", trend: "flat" },
    { driver: "Multi-vehicle liability allocation pending", share: 0.11, owner: "Senior review", trend: "down" },
    { driver: "IVR drop · loss statement not captured", share: 0.09, owner: "Intake Recovery", trend: "down" },
    { driver: "Damage estimate above Fast Track band", share: 0.08, owner: "Senior review", trend: "up" },
    { driver: "Other", share: 0.05, owner: "—", trend: "flat" },
  ];
  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-ink-200">
        Exceptions are claims that exit the auto-route path. Driver mix is intentionally surfaced — these are the levers for the next routine release.
      </p>
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="text-2xs uppercase tracking-wider text-ink-300">
            <th className="text-left font-medium py-1.5">Driver</th>
            <th className="text-right font-medium py-1.5">Share</th>
            <th className="text-left font-medium py-1.5 pl-4">Owner</th>
            <th className="text-left font-medium py-1.5">Trend</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.driver} className="border-t border-ink-700/60">
              <td className="py-1.5 text-ink-100 max-w-[420px]">{d.driver}</td>
              <td className="py-1.5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-24 h-1 bg-ink-700 rounded-sm overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${Math.round(d.share * 100)}%` }} />
                  </div>
                  <span className="font-mono text-ink-200 w-10 text-right">{Math.round(d.share * 100)}%</span>
                </div>
              </td>
              <td className="py-1.5 pl-4 text-ink-100">{d.owner}</td>
              <td className="py-1.5 text-ink-300">
                {d.trend === "down" ? "↓ improving" : d.trend === "up" ? "↑ worsening" : "→ flat"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-2xs text-ink-400">
        Note: missing-report exceptions dropped after the v3.1 outbound-recovery prompt update on May 9.
      </div>
    </div>
  );
}

function BoardView() {
  return (
    <div className="space-y-4 text-[12.5px] text-ink-100">
      <div className="grid grid-cols-3 gap-3">
        <BoardStat label="Cycle time (median FNOL→assign)" value="14m" sub="Baseline 3h 01m · −92%" tone="good" />
        <BoardStat label="Adjuster-minutes reclaimed / claim" value="37m" sub="× 2,346 claims wk-to-date" tone="good" />
        <BoardStat label="Auto-assignment coverage" value="72.4%" sub="Threshold ≥ 0.85" tone="good" />
        <BoardStat label="Override rate" value="6.8%" sub="SLA band 5–10% · justification enforced" tone="neutral" />
        <BoardStat label="Reroute rate" value="3.1%" sub="−1.9 pts vs. wk2" tone="good" />
        <BoardStat label="Silent reroutes" value="0" sub="System-side reroutes without audit entry" tone="good" />
      </div>

      <div className="grid grid-cols-3 gap-3 pt-1">
        <BoardCallout
          heading="What changed this week"
          body="v3.1 outbound-recovery prompt update shipped May 9. Missing-report exceptions down 11 pts. No production incidents. No threshold changes."
        />
        <BoardCallout
          heading="Where we are stretching"
          body="Intake recovery SMS provider latency intermittent. Failover to secondary provider tested and one-click ready."
        />
        <BoardCallout
          heading="Next milestone (wk 6)"
          body="Bilingual recovery prompts (ES) and after-hours IVR handback. Same threshold profile, no model change."
        />
      </div>

      <div className="px-3 py-3 bg-ink-800 border border-ink-700 rounded-sm">
        <div className="data-label">Recommendation to steering committee</div>
        <div className="text-ink-100 mt-1">
          Continue current deployment through week 12. Begin discovery on the second workflow (recommend: bodily-injury intake handoff) starting week 8 with a parallel design partner pattern. No re-baselining required.
        </div>
      </div>
    </div>
  );
}

function BoardStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "good" | "neutral" | "warn";
}) {
  const c = tone === "good" ? "text-ok" : tone === "warn" ? "text-amber" : "text-ink-50";
  return (
    <div className="px-3 py-2.5 bg-ink-800 border border-ink-700 rounded-sm">
      <div className="data-label">{label}</div>
      <div className={`text-[22px] font-medium leading-none mt-1 ${c}`}>{value}</div>
      <div className="text-2xs text-ink-400 mt-1.5">{sub}</div>
    </div>
  );
}

function BoardCallout({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="px-3 py-2.5 bg-ink-800 border border-ink-700 rounded-sm">
      <div className="data-label">{heading}</div>
      <div className="text-[12.5px] text-ink-200 mt-1 leading-relaxed">{body}</div>
    </div>
  );
}

function SampleClaimView({ onOpenClaim }: { onOpenClaim: () => void }) {
  return (
    <div className="space-y-3 text-[12.5px] text-ink-100">
      <p>
        We picked one claim that materially shows the workflow — high-risk SIU referral, where the routine halts auto-routing, surfaces indicators, and forces a justified human decision. Click below to open it in the adjuster workbench.
      </p>
      <div className="px-3 py-2.5 bg-ink-800 border border-ink-700 rounded-sm">
        <div className="font-mono text-[12.5px] text-accent">CLM-2026-0451780</div>
        <div className="text-ink-100 mt-1">Marcus Hale · single-vehicle total loss · Miami, FL · {formatMoney(19800)}</div>
        <div className="text-2xs text-ink-300 mt-0.5">
          Four SIU indicators · policy bound 28d prior to loss · routing held at 34% confidence
        </div>
      </div>
      <button onClick={onOpenClaim} className="btn btn-primary">
        Open in adjuster workbench →
      </button>
    </div>
  );
}
