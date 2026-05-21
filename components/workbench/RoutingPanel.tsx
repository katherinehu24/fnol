"use client";

import { useState } from "react";
import { Panel, Pill, ConfidenceBar, IconDot } from "@/components/ui/primitives";
import { ADJUSTERS, getAdjusterById } from "@/lib/data";
import { useWorkbench } from "@/lib/store";
import type { Claim, RoutingDecision } from "@/lib/types";

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

export function RoutingPanel({ claim }: { claim: Claim }) {
  const { confirmAssignment, overrideRouting, escalateClaim, requestDocuments } = useWorkbench();
  const [overrideOpen, setOverrideOpen] = useState(false);

  const passing = claim.routing.confidence >= claim.routing.threshold;
  const assignee = getAdjusterById(claim.routing.assigneeId);

  const decided = !!claim.decision;

  return (
    <div className="overflow-y-auto p-3 space-y-3 bg-ink-850 border-l border-ink-700">
      {/* Routing recommendation */}
      <Panel
        title="Routing recommendation"
        subtitle="Routine: Routing v3.0"
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
          </div>
        ) : (
          <ActionButtons claim={claim} passing={passing} onOverride={() => setOverrideOpen(true)} confirm={() => confirmAssignment(claim.id, claim.routing.assigneeName ?? "—")} escalate={escalateClaim} request={requestDocuments} />
        )}
      </Panel>

      {/* Override modal — inline panel */}
      {overrideOpen && (
        <OverridePanel
          claim={claim}
          onClose={() => setOverrideOpen(false)}
          onSubmit={(assignee, reason) => {
            overrideRouting(claim.id, assignee, reason);
            setOverrideOpen(false);
          }}
        />
      )}

      <Panel title="Workflow delta" subtitle="vs. pre-deployment baseline">
        <ul className="text-[12.5px] text-ink-100 space-y-1.5">
          <DeltaLine ok>FNOL → assembled claim package: <span className="font-mono">11m</span> <span className="text-ink-400">(was ~3h)</span></DeltaLine>
          <DeltaLine ok>Manual document chase: <span className="font-mono">eliminated</span> for clean intakes</DeltaLine>
          <DeltaLine ok>Policy + coverage bind: <span className="font-mono">automatic</span> from PolicyCenter</DeltaLine>
          <DeltaLine ok>Adjuster sees: assembled package, not swivel-chair tasks</DeltaLine>
          <DeltaLine warn>Override path preserved · human judgment visible in audit</DeltaLine>
        </ul>
      </Panel>
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
}: {
  claim: Claim;
  passing: boolean;
  onOverride: () => void;
  confirm: () => void;
  escalate: (claimId: string, target: string, reason: string) => void;
  request: (claimId: string, channel: "sms" | "email" | "agent_callback") => void;
}) {
  const dec = claim.routing.decision;
  if (dec === "auto_assign") {
    return (
      <div className="space-y-2">
        <button onClick={confirm} className="btn btn-primary w-full">
          Confirm assignment → {claim.routing.assigneeName}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onOverride} className="btn btn-ghost">Override</button>
          <button
            onClick={() => escalate(claim.id, "Senior Review", "Supervisor flagged for review")}
            className="btn btn-ghost"
          >
            Escalate
          </button>
        </div>
        {!passing && (
          <div className="text-2xs text-amber">
            Confidence below threshold — confirmation requires supervisor sign-off.
          </div>
        )}
      </div>
    );
  }
  if (dec === "intake_recovery") {
    return (
      <div className="space-y-2">
        <button
          onClick={() => request(claim.id, "sms")}
          className="btn btn-primary w-full"
        >
          Dispatch outbound document request (SMS)
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => request(claim.id, "agent_callback")} className="btn btn-ghost">
            Agent callback
          </button>
          <button onClick={onOverride} className="btn btn-ghost">
            Override → assign now
          </button>
        </div>
      </div>
    );
  }
  if (dec === "senior_review") {
    return (
      <div className="space-y-2">
        <button onClick={confirm} className="btn btn-primary w-full">
          Confirm → {claim.routing.assigneeName} (Senior)
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onOverride} className="btn btn-ghost">Reassign</button>
          <button
            onClick={() => escalate(claim.id, "Compliance · SIU desk", "Manual escalation")}
            className="btn btn-warn"
          >
            Escalate further
          </button>
        </div>
      </div>
    );
  }
  if (dec === "compliance_escalation") {
    return (
      <div className="space-y-2">
        <button
          onClick={() => escalate(claim.id, "Compliance · SIU desk · P. Iyer", "Confirm SIU referral")}
          className="btn btn-crit w-full"
        >
          Confirm SIU referral · halt reserve
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onOverride} className="btn btn-ghost">Override (justify)</button>
          <button onClick={confirm} className="btn btn-ghost">Accept · monitor</button>
        </div>
        <div className="text-2xs text-crit">
          SIU override requires written justification. All overrides logged for Compliance review.
        </div>
      </div>
    );
  }
  if (dec === "manual_reconciliation") {
    return (
      <div className="space-y-2">
        <button onClick={confirm} className="btn btn-primary w-full">
          Confirm → {claim.routing.assigneeName} (Senior)
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onOverride} className="btn btn-ghost">Reassign</button>
          <button
            onClick={() => escalate(claim.id, "Subrogation queue", "Open subrogation in parallel")}
            className="btn btn-ghost"
          >
            Open subrogation
          </button>
        </div>
      </div>
    );
  }
  return null;
}

function OverridePanel({
  claim,
  onClose,
  onSubmit,
}: {
  claim: Claim;
  onClose: () => void;
  onSubmit: (assignee: string, reason: string) => void;
}) {
  const [assignee, setAssignee] = useState<string>(ADJUSTERS[2].name);
  const [reason, setReason] = useState<string>("");
  const valid = reason.trim().length > 6;
  return (
    <Panel title="Override routing" subtitle="audit-logged · justification required" actions={<button onClick={onClose} className="text-2xs text-ink-300 hover:text-ink-100 uppercase tracking-wider">Cancel</button>}>
      <div className="space-y-2">
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
          <div className="data-label mb-1">Justification (required, logged for compliance)</div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. Whitford has 3 prior claims with this insured — reassign to avoid conflict."
            className="w-full bg-ink-900 border border-ink-700 rounded-sm px-2 py-1.5 text-[12.5px] text-ink-100 placeholder-ink-400 focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center justify-between text-2xs text-ink-400">
          <span>From: <span className="text-ink-100">{claim.routing.assigneeName ?? claim.routing.decision}</span></span>
          <span>Confidence: <span className="font-mono">{Math.round(claim.routing.confidence * 100)}%</span></span>
        </div>
        <button
          disabled={!valid}
          onClick={() => onSubmit(assignee, reason)}
          className="btn btn-primary w-full"
        >
          Submit override
        </button>
      </div>
    </Panel>
  );
}

function DeltaLine({ children, ok, warn }: { children: React.ReactNode; ok?: boolean; warn?: boolean }) {
  return (
    <li className="flex items-start gap-2">
      <IconDot tone={warn ? "warn" : ok ? "good" : "neutral"} />
      <span>{children}</span>
    </li>
  );
}
