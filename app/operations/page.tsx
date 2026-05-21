import { Panel, Pill, Stat, IconDot } from "@/components/ui/primitives";
import { ADJUSTERS, EXCEPTIONS, OPS_METRICS, QUEUE_BUCKETS } from "@/lib/data";
import { formatAge } from "@/lib/format";

export default function OperationsPage() {
  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-76px)] overflow-y-auto">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xs text-ink-400 uppercase tracking-wider">SVP Claims Operations · Maria Chen</div>
          <h1 className="text-[20px] font-medium text-ink-50">Operations control · Auto PD FNOL intake</h1>
          <div className="text-[12.5px] text-ink-300 mt-0.5">
            Production deployment · week 4 of 12 · <span className="text-ok">2,346 claims processed since cutover</span>
          </div>
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
        <Panel title="Queue state · live" subtitle="all Auto PD intakes" className="col-span-2">
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
        <Panel title="Workflow exceptions · open" subtitle={`${EXCEPTIONS.length} open · routed to humans`} className="col-span-2">
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
                <tr key={e.id} className="border-t border-ink-700/60">
                  <td className="py-1.5 font-mono text-[11.5px] text-ink-100">{e.claimId}</td>
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
  // Stable per-bucket movement bars so screenshots are deterministic.
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
