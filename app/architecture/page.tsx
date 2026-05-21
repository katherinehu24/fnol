import { Panel, Pill, IconDot } from "@/components/ui/primitives";
import { DecisionLattice } from "@/components/architecture/DecisionLattice";
import {
  EXCEPTION_TAXONOMY,
  HITL_CHECKPOINTS,
  METRIC_DEFS,
  THRESHOLD_RULES,
} from "@/lib/architecture";

export default function ArchitecturePage() {
  return (
    <div className="max-h-[calc(100vh-76px)] overflow-y-auto">
      <div className="max-w-[1480px] mx-auto px-6 py-7 space-y-10">
        {/* Hero */}
        <header>
          <div className="text-2xs uppercase tracking-[0.18em] text-accent">
            FNOL Auto PD · Routing Architecture
          </div>
          <h1 className="text-[26px] font-medium text-ink-50 mt-2 leading-tight max-w-[920px]">
            Before deployment, we align on this. After deployment, we measure it. Then we expand.
          </h1>
          <p className="text-[13.5px] text-ink-200 mt-3 max-w-[880px] leading-relaxed">
            One workflow, decomposed. Five stages from intake to outcome. Every stage names what gets
            automated, what needs human review, and what halts for escalation. Thresholds and
            checkpoints are owned by Compliance — not by the vendor.
          </p>
        </header>

        {/* The lattice — the centerpiece */}
        <DecisionLattice />

        {/* HITL checkpoints */}
        <Section
          number="A"
          title="Human-in-the-loop checkpoints"
          kicker="Six places where automation stops and a human decides."
        >
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-2xs uppercase tracking-[0.14em] text-ink-300">
                <th className="text-left font-medium pb-2 pr-4">Where</th>
                <th className="text-left font-medium pb-2 pr-4">Trigger</th>
                <th className="text-left font-medium pb-2 pr-4">Action</th>
                <th className="text-left font-medium pb-2 pr-4">Justification</th>
                <th className="text-left font-medium pb-2">Owner</th>
              </tr>
            </thead>
            <tbody>
              {HITL_CHECKPOINTS.map((c) => (
                <tr key={c.id} className="border-t border-ink-700/60">
                  <td className="py-2 pr-4 text-ink-100">{c.where}</td>
                  <td className="py-2 pr-4 text-ink-200">{c.trigger}</td>
                  <td className="py-2 pr-4 text-ink-200">{c.action}</td>
                  <td className="py-2 pr-4">
                    <Pill tone={c.justification === "always" ? "crit" : c.justification === "if_override" ? "warn" : "neutral"}>
                      {c.justification === "always"
                        ? "Always required"
                        : c.justification === "if_override"
                        ? "If overridden"
                        : "Not required"}
                    </Pill>
                  </td>
                  <td className="py-2 text-ink-100">{c.ownership}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Threshold rules */}
        <Section
          number="B"
          title="Decision thresholds"
          kicker="Compliance owns these. IT cannot change them. The vendor cannot change them."
        >
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-2xs uppercase tracking-[0.14em] text-ink-300">
                <th className="text-left font-medium pb-2 pr-4">Routing class</th>
                <th className="text-left font-medium pb-2 pr-4">Threshold</th>
                <th className="text-left font-medium pb-2 pr-4">Below → escalates to</th>
                <th className="text-left font-medium pb-2 pr-4">Owner</th>
                <th className="text-left font-medium pb-2">Last calibrated</th>
              </tr>
            </thead>
            <tbody>
              {THRESHOLD_RULES.map((t) => (
                <tr key={t.id} className="border-t border-ink-700/60">
                  <td className="py-2 pr-4 text-ink-100">{t.cls}</td>
                  <td className="py-2 pr-4 font-mono text-ink-200">{t.threshold}</td>
                  <td className="py-2 pr-4 text-ink-200">{t.below}</td>
                  <td className="py-2 pr-4 text-ink-100">{t.owner}</td>
                  <td className="py-2 font-mono text-2xs text-ink-300">{t.lastChanged}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Exception taxonomy */}
        <Section
          number="C"
          title="Exception taxonomy"
          kicker="Nine reasons a claim leaves the auto-route path. Every one has a destination and an owner."
        >
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-2xs uppercase tracking-[0.14em] text-ink-300">
                <th className="text-left font-medium pb-2 pr-4">Exception</th>
                <th className="text-left font-medium pb-2 pr-4">Trigger</th>
                <th className="text-left font-medium pb-2 pr-4">Destination</th>
                <th className="text-left font-medium pb-2 pr-4">Owner</th>
                <th className="text-right font-medium pb-2">Share</th>
              </tr>
            </thead>
            <tbody>
              {EXCEPTION_TAXONOMY.map((e) => (
                <tr key={e.id} className="border-t border-ink-700/60">
                  <td className="py-2 pr-4 text-ink-100">{e.name}</td>
                  <td className="py-2 pr-4 text-ink-200">{e.trigger}</td>
                  <td className="py-2 pr-4 text-ink-200">{e.destination}</td>
                  <td className="py-2 pr-4 text-ink-100">{e.owner}</td>
                  <td className="py-2 text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-24 h-1 bg-ink-700 rounded-sm overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${Math.round(e.share * 100)}%` }} />
                      </div>
                      <span className="font-mono text-ink-200 w-9 text-right">
                        {Math.round(e.share * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Governance posture */}
        <Section
          number="D"
          title="Governance posture"
          kicker="Plain language. The four sentences that make this defensible."
        >
          <div className="grid grid-cols-2 gap-x-10 gap-y-4">
            <PostureLine
              title="Compliance owns the thresholds."
              body="Threshold changes require Priya's sign-off. Versioned. Vendor cannot push a model change that re-tunes routing without re-approval."
            />
            <PostureLine
              title="Every override is justified, logged, and reviewed."
              body="Adjusters cannot silently reroute. Reason category is required. The full override register is exported weekly to Compliance."
            />
            <PostureLine
              title="ClaimCenter remains the system of record."
              body="No shadow data store. Routines write assignments, status, and notes back to Guidewire. Audit history is queryable from either system."
            />
            <PostureLine
              title="SIU pathway is rule-engine first."
              body="The SIU rule engine runs before routing. Any indicator above threshold halts auto-routing and pages SIU. Reserve posting blocked until SIU clears."
            />
          </div>
        </Section>

        {/* Operational metrics */}
        <Section
          number="E"
          title="Operational metrics"
          kicker="Eight measurements. Each named, defined, baselined."
        >
          <div className="grid grid-cols-4 gap-3">
            {METRIC_DEFS.map((m) => {
              const c =
                m.intent === "good"
                  ? "text-ok"
                  : m.intent === "warn"
                  ? "text-amber"
                  : "text-ink-50";
              return (
                <div key={m.id} className="panel px-3 py-3 bg-ink-800">
                  <div className="data-label">{m.label}</div>
                  <div className={`text-[22px] font-medium leading-none mt-1.5 ${c}`}>{m.value}</div>
                  <div className="text-2xs text-ink-400 mt-1.5">
                    Baseline: <span className="text-ink-200">{m.baseline}</span>
                  </div>
                  <div className="text-2xs text-ink-300 mt-2 leading-relaxed">{m.definition}</div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Closing line */}
        <div className="pt-2 pb-6 border-t border-ink-700 text-[12.5px] text-ink-300 leading-relaxed">
          <span className="text-ink-100">Deployment philosophy.</span>{" "}
          One workflow, deployed deep, measured rigorously. The architecture above is the contract between vendor, IT, Compliance, and Operations. When we expand to the next workflow, we re-run this exact decomposition first.
        </div>
      </div>
    </div>
  );
}

function Section({
  number,
  title,
  kicker,
  children,
}: {
  number: string;
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-2xs text-ink-400">{number}</span>
        <h2 className="text-[17px] font-medium text-ink-50 leading-tight">{title}</h2>
      </div>
      {kicker && <p className="text-[12.5px] text-ink-300 max-w-[760px]">{kicker}</p>}
      <div className="pt-1">{children}</div>
    </section>
  );
}

function PostureLine({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <IconDot tone="info" />
      <div>
        <div className="text-[13px] text-ink-50">{title}</div>
        <div className="text-[12.5px] text-ink-300 mt-1 leading-relaxed">{body}</div>
      </div>
    </div>
  );
}
