"use client";

import { useState } from "react";
import { Panel, Pill, ConfidenceBar, IconDot } from "@/components/ui/primitives";
import { ADJUSTERS, getAdjusterById } from "@/lib/data";
import { REASON_LABELS, useWorkbench } from "@/lib/store";
import type { Claim, OverrideReasonCategory, RoutingDecision } from "@/lib/types";

const DECISION_LABEL: Record<RoutingDecision, string> = {
  auto_assign: "Auto-assign",
  intake_recovery: "Intake recovery",
  senior_review: "Senior review",
  compliance_escalation: "Compliance · SIU desk",
  manual_reconciliation: "Manual reconciliation",
};

const DECISION_TONE: Record<RoutingDecision, "good" | "warn" | "crit" | "info"> = {
  auto_assign: "good",
  intake_recovery: "warn",
  senior_review: "info",
  compliance_escalation: "crit",
  manual_reconciliation: "warn",
};

type Tier = "auto" | "review" | "escalate";

function tierFor(confidence: number, hasSiu: boolean): Tier {
  if (hasSiu) return "escalate";
  if (confidence >= 0.85) return "auto";
  if (confidence >= 0.5) return "review";
  return "escalate";
}

const TIER_LABEL: Record<Tier, string> = {
  auto: "Clear · auto-route",
  review: "Partial · human review",
  escalate: "Escalation · halt",
};

const TIER_TONE: Record<Tier, "good" | "warn" | "crit"> = {
  auto: "good",
  review: "warn",
  escalate: "crit",
};

const TIER_RULE: Record<Tier, string> = {
  auto: "Clear intake · no escalation signals",
  review: "Partial intake · or coverage ambiguity",
  escalate: "Insufficient intake · or SIU criteria met",
};

export function RoutingPanel({ claim }: { claim: Claim }) {
  const { confirmAssignment, overrideRouting, escalateClaim, requestDocuments, focusAuditTrail } = useWorkbench();
  const [overrideOpen, setOverrideOpen] = useState(false);

  const passing = claim.routing.confidence >= claim.routing.threshold;
  const assignee = getAdjusterById(claim.routing.assigneeId);
  const tier = tierFor(claim.routing.confidence, !!claim.siuFlags?.length);
  const decided = !!claim.decision;

  return (
    <div className="overflow-y-auto p-3 space-y-3 bg-ink-850 border-l border-ink-700">
      {/* Intake readiness — qualitative tier */}
      <div className="panel px-3 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <span className="data-label">Intake readiness</span>
          <Pill tone={TIER_TONE[tier]}>{TIER_LABEL[tier]}</Pill>
        </div>
        <ThresholdGuide tier={tier} confidence={claim.routing.confidence} hasSiu={!!claim.siuFlags?.length} />
      </div>

      {/* Routing recommendation */}
      <Panel
        title="Routing recommendation"
        subtitle="operational routing"
        actions={<Pill tone={DECISION_TONE[claim.routing.decision]}>{DECISION_LABEL[claim.routing.decision]}</Pill>}
      >
        <ConfidenceBar value={claim.routing.confidence} threshold={claim.routing.threshold} />

        {claim.routing.assigneeName && (
          <div className="mt-3 px-2 py-2 bg-ink-800 border border-ink-700 rounded-sm">
            <div className="data-label mb-1">Recommended assignee</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] text-ink-50">{claim.routing.assigneeName}</div>
                <div className="text-2xs text-ink-300">
                  {assignee?.team ?? "—"} · {assignee?.tier.replace("_", " ")}
                </div>
              </div>
              {assignee && (
                <div className="text-right">
                  <div className="font-mono text-[11.5px] text-ink-100">
                    {assignee.load}/{assignee.capacity}
                  </div>
                  <div className="text-2xs text-ink-400">open load</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-3">
          <div className="data-label mb-1">Rationale</div>
          <ul className="text-[12.5px] text-ink-100 space-y-1.5">
            {claim.routing.rationale.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-ink-400 font-mono text-[11px] pt-0.5">{String(i + 1).padStart(2, "0")}</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {claim.routing.blockers && claim.routing.blockers.length > 0 && (
          <div className="mt-3 px-2 py-2 bg-amber-900/30 border border-amber/30 rounded-sm">
            <div className="text-2xs uppercase tracking-wider text-amber mb-1">Blockers</div>
            <ul className="text-[12px] text-ink-100 space-y-0.5">
              {claim.routing.blockers.map((b, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <IconDot tone="warn" /> {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {claim.siuFlags && (
          <div className="mt-3 px-2 py-2 bg-crit-900/40 border border-crit/30 rounded-sm">
            <div className="text-2xs uppercase tracking-wider text-crit mb-1">SIU indicators ({claim.siuFlags.length})</div>
            <ul className="text-[12px] text-ink-100 space-y-0.5">
              {claim.siuFlags.map((f, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <IconDot tone="crit" /> {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {claim.routing.alternates && claim.routing.alternates.length > 0 && (
          <div className="mt-3">
            <div className="data-label mb-1">Alternates by load</div>
            <div className="space-y-1">
              {claim.routing.alternates.map((alt) => (
                <div key={alt.assigneeId} className="flex items-center justify-between text-[12px] py-1 px-2 bg-ink-800 border border-ink-700/60 rounded-sm">
                  <span className="text-ink-100">{alt.assigneeName}</span>
                  <span className="font-mono text-ink-300">{alt.load} open</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>

      {/* Next best action */}
      <Panel title="Next best action" subtitle="adjuster-facing">
        {decided ? (
          <div className="px-2 py-2 bg-ok-900/40 border border-ok/30 rounded-sm">
            <div className="flex items-center gap-2">
              <IconDot tone="good" />
              <span className="text-[13px] text-ink-50">
                {claim.decision?.action === "confirmed"
                  ? "Assignment confirmed"
                  : claim.decision?.action === "overridden"
                  ? "Routing overridden"
                  : "Manual escalation"}
              </span>
            </div>
            <div className="text-2xs text-ink-300 mt-1">
              {claim.decision?.note}
              {claim.decision?.reroutedTo && <> → {claim.decision.reroutedTo}</>}
            </div>
            <button
              onClick={focusAuditTrail}
              className="mt-2 text-2xs text-ink-300 hover:text-ink-100 uppercase tracking-wider underline-offset-2 hover:underline"
            >
              View audit trail
            </button>
          </div>
        ) : (
          <ActionButtons
            claim={claim}
            passing={passing}
            onOverride={() => setOverrideOpen(true)}
            confirm={() => confirmAssignment(claim.id, claim.routing.assigneeName ?? "—")}
            escalate={escalateClaim}
            request={requestDocuments}
            focusAudit={focusAuditTrail}
          />
        )}
      </Panel>

      {/* Override panel */}
      {overrideOpen && (
        <OverridePanel
          claim={claim}
          onClose={() => setOverrideOpen(false)}
          onSubmit={(assignee, category, notes) => {
            overrideRouting(claim.id, assignee, category, notes);
            setOverrideOpen(false);
          }}
        />
      )}

    </div>
  );
}

function ThresholdGuide({ tier, confidence, hasSiu }: { tier: Tier; confidence: number; hasSiu: boolean }) {
  const pct = Math.round(confidence * 100);
  const readiness =
    tier === "auto" ? "Ready to assign" : tier === "review" ? "Needs review" : hasSiu ? "Halt · SIU" : "Halt · escalate";
  return (
    <div className="space-y-1">
      <TierLine label="Clear intake" sub="auto-route" tone="good" active={tier === "auto"} />
      <TierLine label="Partial intake" sub="human review" tone="warn" active={tier === "review"} />
      <TierLine label="Escalation signals" sub="halt for review" tone="crit" active={tier === "escalate"} />
      <div className="pt-2 mt-1 border-t border-ink-700/60 flex items-baseline justify-between text-2xs text-ink-300">
        <span>This claim</span>
        <span className="text-ink-100">
          {readiness}
          {hasSiu && <span className="text-crit"> · {pct}% ready</span>}
          {!hasSiu && <span className="text-ink-300 font-mono"> · {pct}% ready</span>}
        </span>
      </div>
    </div>
  );
}

function TierLine({
  label,
  sub,
  tone,
  active,
}: {
  label: string;
  sub: string;
  tone: "good" | "warn" | "crit";
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between text-2xs ${
        active ? "text-ink-50" : "text-ink-400"
      }`}
    >
      <span className="flex items-center gap-1.5">
        <IconDot tone={tone} />
        {label}
      </span>
      <span className={active ? "text-ink-200" : "text-ink-500"}>{sub}</span>
    </div>
  );
}

function ActionButtons({
  claim,
  passing,
  onOverride,
  confirm,
  escalate,
  request,
  focusAudit,
}: {
  claim: Claim;
  passing: boolean;
  onOverride: () => void;
  confirm: () => void;
  escalate: (claimId: string, target: string, reason: string) => void;
  request: (claimId: string, channel: "sms" | "email" | "agent_callback") => void;
  focusAudit: () => void;
}) {
  const dec = claim.routing.decision;
  const auditLink = (
    <button
      onClick={focusAudit}
      className="text-2xs text-ink-300 hover:text-ink-100 uppercase tracking-wider underline-offset-2 hover:underline"
    >
      View audit trail
    </button>
  );

  if (dec === "auto_assign") {
    return (
      <div className="space-y-2">
        <button onClick={confirm} className="btn btn-primary w-full" data-demo="confirm">
          Approve routing → {claim.routing.assigneeName}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onOverride} className="btn btn-ghost">Override</button>
          <button
            onClick={() => escalate(claim.id, "Senior Review", "Supervisor flagged for review")}
            className="btn btn-ghost"
          >
            Escalate to SIU
          </button>
        </div>
        <div className="flex justify-between items-center pt-1">
          {auditLink}
          {!passing && (
            <span className="text-2xs text-amber">Below threshold — confirm needs sign-off.</span>
          )}
        </div>
      </div>
    );
  }
  if (dec === "intake_recovery") {
    return (
      <div className="space-y-2">
        <button
          onClick={() => request(claim.id, "sms")}
          className="btn btn-primary w-full"
          data-demo="request"
        >
          Request missing documents (SMS)
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => request(claim.id, "agent_callback")} className="btn btn-ghost">
            Agent callback
          </button>
          <button onClick={onOverride} className="btn btn-ghost">
            Override → assign now
          </button>
        </div>
        <div className="flex justify-between items-center pt-1">{auditLink}</div>
      </div>
    );
  }
  if (dec === "senior_review") {
    return (
      <div className="space-y-2">
        <button onClick={confirm} className="btn btn-primary w-full">
          Approve routing → {claim.routing.assigneeName} (Senior)
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onOverride} className="btn btn-ghost">Override</button>
          <button
            onClick={() => escalate(claim.id, "Compliance · SIU desk", "Manual escalation")}
            className="btn btn-warn"
          >
            Escalate to SIU
          </button>
        </div>
        <div className="flex justify-between items-center pt-1">{auditLink}</div>
      </div>
    );
  }
  if (dec === "compliance_escalation") {
    return (
      <div className="space-y-2">
        <button
          onClick={() => escalate(claim.id, "Compliance · SIU desk · P. Iyer", "SIU referral confirmed")}
          className="btn btn-crit w-full"
          data-demo="escalate"
        >
          Escalate to SIU · halt reserve
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onOverride} className="btn btn-ghost">Override (justify)</button>
          <button onClick={confirm} className="btn btn-ghost">Accept · monitor</button>
        </div>
        <div className="flex justify-between items-center pt-1">
          {auditLink}
          <span className="text-2xs text-crit">Override requires written reason.</span>
        </div>
      </div>
    );
  }
  if (dec === "manual_reconciliation") {
    return (
      <div className="space-y-2">
        <button onClick={confirm} className="btn btn-primary w-full">
          Approve routing → {claim.routing.assigneeName} (Senior)
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onOverride} className="btn btn-ghost">Override</button>
          <button
            onClick={() => escalate(claim.id, "Subrogation queue", "Open subrogation in parallel")}
            className="btn btn-ghost"
          >
            Open subrogation
          </button>
        </div>
        <div className="flex justify-between items-center pt-1">{auditLink}</div>
      </div>
    );
  }
  return null;
}

const REASON_OPTIONS: OverrideReasonCategory[] = [
  "missing_docs",
  "coverage_ambiguity",
  "injury_severity",
  "fraud_siu",
  "customer_escalation",
  "load_balancing",
  "conflict",
];

function OverridePanel({
  claim,
  onClose,
  onSubmit,
}: {
  claim: Claim;
  onClose: () => void;
  onSubmit: (assignee: string, category: OverrideReasonCategory, notes: string) => void;
}) {
  const [assignee, setAssignee] = useState<string>(ADJUSTERS[2].name);
  const [category, setCategory] = useState<OverrideReasonCategory>("coverage_ambiguity");
  const [notes, setNotes] = useState<string>("");

  return (
    <Panel
      title="Override routing · justification required"
      subtitle="every override logged for Compliance"
      actions={
        <button onClick={onClose} className="text-2xs text-ink-300 hover:text-ink-100 uppercase tracking-wider">
          Cancel
        </button>
      }
    >
      <div className="space-y-2.5">
        <div>
          <div className="data-label mb-1">Reassign to</div>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full bg-ink-900 border border-ink-700 rounded-sm px-2 py-1.5 text-[12.5px] text-ink-100 focus:outline-none focus:border-accent"
          >
            {ADJUSTERS.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name} — {a.team} · {a.load}/{a.capacity} open
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="data-label mb-1">Override category (audit-logged)</div>
          <div className="grid grid-cols-1 gap-1">
            {REASON_OPTIONS.map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-2 px-2 py-1.5 border rounded-sm cursor-pointer text-[12.5px] ${
                  category === opt
                    ? "bg-accent/10 border-accent text-ink-50"
                    : "bg-ink-900 border-ink-700 text-ink-200 hover:border-ink-500"
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  checked={category === opt}
                  onChange={() => setCategory(opt)}
                  className="accent-accent"
                />
                {REASON_LABELS[opt]}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="data-label mb-1">Notes (optional)</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Optional context — e.g. prior claim on same insured"
            className="w-full bg-ink-900 border border-ink-700 rounded-sm px-2 py-1.5 text-[12.5px] text-ink-100 placeholder-ink-400 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center justify-between text-2xs text-ink-400">
          <span>
            From: <span className="text-ink-100">{claim.routing.assigneeName ?? claim.routing.decision}</span>
          </span>
          <span>
            Confidence: <span className="font-mono">{Math.round(claim.routing.confidence * 100)}%</span>
          </span>
        </div>

        <button onClick={() => onSubmit(assignee, category, notes)} className="btn btn-primary w-full">
          Submit override
        </button>
      </div>
    </Panel>
  );
}

