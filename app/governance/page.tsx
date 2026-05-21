"use client";

import { Panel, Pill, IconDot, DataRow } from "@/components/ui/primitives";
import { INTEGRATIONS } from "@/lib/data";
import { useWorkbench } from "@/lib/store";
import { formatDateTime, formatRelative } from "@/lib/format";
import { NOW_ISO } from "@/lib/data";

export default function GovernancePage() {
  const { overrideLog, claims } = useWorkbench();
  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-76px)] overflow-y-auto">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xs text-ink-400 uppercase tracking-wider">Compliance · Priya Raman · IT · David Okafor</div>
          <h1 className="text-[20px] font-medium text-ink-50">Governance · audit surface</h1>
          <div className="text-[12.5px] text-ink-300 mt-0.5">
            Auto PD FNOL · every routing, override, escalation, and integration call is captured.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Pill tone="good">No silent reroutes</Pill>
          <Pill tone="good">Override justification: enforced</Pill>
          <button className="btn btn-ghost">Export audit · CSV</button>
        </div>
      </div>

      {/* Posture row */}
      <div className="grid grid-cols-4 gap-3">
        <PostureCard
          label="Auto-routing coverage"
          value="72.4%"
          sub="Threshold ≥ 0.85 confidence · Fast Track"
          tone="good"
        />
        <PostureCard
          label="Override rate"
          value="6.8%"
          sub="Inside SLA band 5–10% · justification required"
          tone="good"
        />
        <PostureCard
          label="Escalations to senior / SIU"
          value="9.4%"
          sub="Below Routine confidence threshold or rule-triggered"
          tone="neutral"
        />
        <PostureCard
          label="Silent reroutes"
          value="0"
          sub="System-side reroutes without audit entry"
          tone="good"
        />
      </div>

      {/* Override log */}
      <Panel
        title="Override log · last 24h"
        subtitle={`${overrideLog.length} overrides · justification captured for every event`}
        actions={<Pill tone="info">Audit-grade</Pill>}
      >
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="text-2xs uppercase tracking-wider text-ink-300">
              <th className="text-left font-medium py-1.5">Event</th>
              <th className="text-left font-medium py-1.5">Claim</th>
              <th className="text-left font-medium py-1.5">Actor</th>
              <th className="text-left font-medium py-1.5">From → to</th>
              <th className="text-left font-medium py-1.5">Justification</th>
              <th className="text-right font-medium py-1.5">Conf</th>
              <th className="text-right font-medium py-1.5">When</th>
            </tr>
          </thead>
          <tbody>
            {overrideLog.map((o) => (
              <tr key={o.id} className="border-t border-ink-700/60">
                <td className="py-1.5 font-mono text-[11.5px] text-ink-100">{o.id}</td>
                <td className="py-1.5 font-mono text-[11.5px] text-accent">{o.claimId}</td>
                <td className="py-1.5 text-ink-100">{o.actor}</td>
                <td className="py-1.5 text-ink-200 text-[12px]">
                  <span className="text-ink-400">{o.fromRouting}</span>
                  <span className="text-ink-500"> → </span>
                  <span className="text-ink-50">{o.toRouting}</span>
                </td>
                <td className="py-1.5 text-ink-100 max-w-[320px]">{o.reason}</td>
                <td className="py-1.5 text-right font-mono text-ink-200">{Math.round(o.confidence * 100)}%</td>
                <td className="py-1.5 text-right text-ink-300">{formatRelative(o.ts, NOW_ISO)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {/* Threshold + escalation config */}
      <div className="grid grid-cols-2 gap-3">
        <Panel title="Threshold configuration" subtitle="active routing profile · v3.0">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-2xs uppercase tracking-wider text-ink-300">
                <th className="text-left font-medium py-1.5">Routing class</th>
                <th className="text-left font-medium py-1.5">Threshold</th>
                <th className="text-left font-medium py-1.5">Below → escalates to</th>
                <th className="text-left font-medium py-1.5">Last changed</th>
              </tr>
            </thead>
            <tbody>
              <ThresholdRow cls="Fast Track auto-assign" t="≥ 0.85" esc="Senior review" date="2026-05-12 · P. Raman" />
              <ThresholdRow cls="Senior review (coverage)" t="≥ 0.70" esc="Manual reconciliation" date="2026-05-12 · P. Raman" />
              <ThresholdRow cls="Intake recovery" t="any below 0.85" esc="Outbound recovery task" date="2026-04-22 · IT" />
              <ThresholdRow cls="SIU referral (rule-based)" t="≥ 2 indicators" esc="SIU desk · halt reserve" date="2026-04-08 · P. Raman" />
              <ThresholdRow cls="Auto-confirm without supervisor" t="≥ 0.92" esc="Supervisor sign-off below" date="2026-05-12 · P. Raman" />
            </tbody>
          </table>
          <div className="mt-3 px-2 py-2 bg-ink-800 border border-ink-700 rounded-sm text-2xs text-ink-300">
            Threshold changes require Compliance sign-off. All historical values retained for audit. Last calibration review: 2026-05-12.
          </div>
        </Panel>

        <Panel title="Escalation paths" subtitle="human-in-the-loop routing">
          <ul className="space-y-2 text-[12.5px]">
            <PathRow
              from="Routine: Routing v3.0"
              to="Adjuster Workbench · supervisor"
              when="Confidence < 0.85"
              tone="warn"
            />
            <PathRow
              from="Routine: SIU Screen v1.2"
              to="Compliance · SIU desk (P. Iyer)"
              when="≥ 2 indicators · halt reserve posting"
              tone="crit"
            />
            <PathRow
              from="Routine: Coverage Map v2.1"
              to="Senior review (S. Kowalski / J. Forrester)"
              when="Ambiguity flagged · manual interpretation"
              tone="info"
            />
            <PathRow
              from="Adjuster override"
              to="Compliance review (weekly)"
              when="Always — justification required"
              tone="info"
            />
            <PathRow
              from="Intake recovery timeout"
              to="Senior review · manual intake"
              when="No claimant response within 72h"
              tone="warn"
            />
          </ul>
        </Panel>
      </div>

      {/* Integration map + audit-by-claim */}
      <div className="grid grid-cols-3 gap-3">
        <Panel title="Integration map" subtitle="systems, routines, channels" className="col-span-2">
          <div className="grid grid-cols-4 gap-2">
            {(["system_of_record", "channel", "routine", "downstream"] as const).map((kind) => (
              <div key={kind}>
                <div className="data-label mb-1">{kindLabel(kind)}</div>
                <div className="space-y-1">
                  {INTEGRATIONS.filter((n) => n.kind === kind || (kind === "system_of_record" && n.kind === "data_source")).map((n) => (
                    <div key={n.id} className="px-2 py-1.5 bg-ink-800 border border-ink-700 rounded-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] text-ink-100 truncate">{n.label}</span>
                        <IconDot tone={n.status === "healthy" ? "good" : n.status === "degraded" ? "warn" : "crit"} />
                      </div>
                      {n.notes && <div className="text-2xs text-ink-400 mt-0.5">{n.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 px-2 py-2 bg-ink-800 border border-ink-700 rounded-sm text-2xs text-ink-300">
            All integrations are bi-directional with ClaimCenter where applicable. No shadow data store. Routines write directly to ClaimCenter assignment, status, and notes — auditable in Guidewire as the system of record.
          </div>
        </Panel>

        <Panel title="Audit history · per claim" subtitle="select claim to inspect">
          <div className="space-y-1.5">
            {claims.map((c) => (
              <div key={c.id} className="px-2 py-1.5 bg-ink-800 border border-ink-700 rounded-sm">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11.5px] text-ink-100">{c.id}</span>
                  <span className="text-2xs text-ink-300">{c.activity.length} events</span>
                </div>
                <div className="text-2xs text-ink-400 truncate">
                  {c.claimant.name} · {c.loss.type.replace("_", " ")}
                </div>
                <div className="mt-1 flex items-center gap-2 text-2xs">
                  <Pill tone={c.routing.confidence >= c.routing.threshold ? "good" : "warn"}>
                    {Math.round(c.routing.confidence * 100)}% conf
                  </Pill>
                  {c.siuFlags && <Pill tone="crit">SIU</Pill>}
                  {c.decision && (
                    <Pill tone={c.decision.action === "confirmed" ? "good" : c.decision.action === "overridden" ? "warn" : "crit"}>
                      {c.decision.action}
                    </Pill>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Policy header */}
      <Panel title="Governance posture · plain language" subtitle="how this workflow stays defensible">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px] text-ink-100">
          <Posture
            title="Human judgment is never removed."
            body="Every routing decision can be confirmed, overridden, or escalated by a human adjuster. Overrides require written justification, captured in the audit trail."
          />
          <Posture
            title="No shadow systems."
            body="ClaimCenter remains the system of record. Routines write assignments, status, and notes back to Guidewire. Audit history is queryable from either system."
          />
          <Posture
            title="Confidence thresholds are visible and tunable."
            body="Thresholds are owned by Compliance, not by the vendor. Changes require Compliance sign-off and are versioned."
          />
          <Posture
            title="SIU pathway preserved."
            body="SIU rule engine runs first. Any indicator above threshold halts auto-routing and pages the SIU desk. Reserve posting blocked until SIU clears."
          />
        </div>
      </Panel>

      <div className="text-2xs text-ink-400 pb-2 flex items-center gap-2">
        <IconDot tone="info" /> Audit logs retained per NorthBay retention policy (7 years for Auto PD). Export available via ClaimCenter API. Reviewed weekly by Compliance.
      </div>
    </div>
  );
}

function PostureCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "good" | "warn" | "neutral" | "crit";
}) {
  const valueColor =
    tone === "good" ? "text-ok" : tone === "warn" ? "text-amber" : tone === "crit" ? "text-crit" : "text-ink-50";
  return (
    <div className="panel p-3">
      <div className="data-label">{label}</div>
      <div className={`text-[24px] font-medium leading-none mt-1 ${valueColor}`}>{value}</div>
      <div className="text-2xs text-ink-400 mt-1.5">{sub}</div>
    </div>
  );
}

function ThresholdRow({ cls, t, esc, date }: { cls: string; t: string; esc: string; date: string }) {
  return (
    <tr className="border-t border-ink-700/60">
      <td className="py-1.5 text-ink-100">{cls}</td>
      <td className="py-1.5 font-mono text-ink-200">{t}</td>
      <td className="py-1.5 text-ink-200">{esc}</td>
      <td className="py-1.5 text-ink-300 text-2xs">{date}</td>
    </tr>
  );
}

function PathRow({
  from,
  to,
  when,
  tone,
}: {
  from: string;
  to: string;
  when: string;
  tone: "good" | "warn" | "crit" | "info";
}) {
  return (
    <li className="px-2 py-2 bg-ink-800 border border-ink-700 rounded-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-ink-100">{from}</span>
        <span className="text-ink-500">→</span>
        <span className="text-ink-50">{to}</span>
        <Pill tone={tone}>{toneLabel(tone)}</Pill>
      </div>
      <div className="text-2xs text-ink-300 mt-0.5">Trigger: {when}</div>
    </li>
  );
}

function toneLabel(t: "good" | "warn" | "crit" | "info") {
  if (t === "good") return "auto";
  if (t === "warn") return "human review";
  if (t === "crit") return "halt";
  return "manual";
}

function kindLabel(k: string) {
  if (k === "system_of_record") return "Systems of record";
  if (k === "channel") return "Channels";
  if (k === "routine") return "Routines";
  if (k === "downstream") return "Downstream queues";
  return k;
}

function Posture({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex gap-2">
      <IconDot tone="good" />
      <div>
        <div className="text-ink-50">{title}</div>
        <div className="text-ink-300 text-[12px]">{body}</div>
      </div>
    </div>
  );
}
