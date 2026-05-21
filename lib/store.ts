"use client";

import { create } from "zustand";
import { CLAIMS, NOW_ISO, OVERRIDE_LOG } from "./data";
import type {
  AuditEntry,
  Claim,
  DemoStep,
  OverrideEvent,
  OverrideReasonCategory,
  Toast,
} from "./types";

export const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: "Walk the decision architecture",
    body: "Five stages, intake to outcome. Where automation runs, where humans decide, where the workflow halts for compliance. Trace one of the three sample claims to see a path light up.",
    goto: "/architecture",
  },
  {
    step: 2,
    title: "Clean claim → Fast Track",
    body: "Hannah Brennan · rear-end · Cambridge. Policy bound, coverage clean, police report extracted at 97% confidence. Confidence 94%, above the 0.85 threshold — Routine recommends auto-assign.",
    goto: "/workbench",
    claimId: "CLM-2026-0451829",
    highlight: "confirm",
  },
  {
    step: 3,
    title: "Incomplete → Intake Recovery",
    body: "Daniel Ortiz · IL hit-and-run. Police report missing (required by state statute), loss statement never captured, policy lapse pending. Confidence 42% — Routine holds and dispatches outbound recovery.",
    goto: "/workbench",
    claimId: "CLM-2026-0451814",
    highlight: "request",
  },
  {
    step: 4,
    title: "Fraud signals → SIU Escalation",
    body: "Marcus Hale · FL total loss. Four SIU indicators triggered. Routine halts auto-routing, blocks reserve posting, pages the SIU desk. Adjuster can override — but justification is required.",
    goto: "/workbench",
    claimId: "CLM-2026-0451780",
    highlight: "escalate",
  },
  {
    step: 5,
    title: "Override → written reason captured",
    body: "Open Override on any claim. Reason category is required: missing docs, coverage ambiguity, injury severity, fraud/SIU, customer escalation. Logged for weekly Compliance review.",
    goto: "/workbench",
    claimId: "CLM-2026-0451802",
  },
  {
    step: 6,
    title: "Audit trail",
    body: "Every event — Routine and human — captured with actor, timestamp, decision class. Same trail in ClaimCenter. No shadow store. Exportable for Compliance.",
    goto: "/workbench",
    claimId: "CLM-2026-0451829",
  },
  {
    step: 7,
    title: "Operational impact",
    body: "Maria's view. Cycle time down 92%. Backlog clearing. Override rate inside SLA band. Board-ready takeaway and four drill-ins — SLA risk, exception drivers, board summary, sample claim.",
    goto: "/operations",
  },
];

interface WorkbenchState {
  claims: Claim[];
  selectedClaimId: string;
  overrideLog: OverrideEvent[];
  toasts: Toast[];
  demoMode: { active: boolean; step: number };
  audiTrailFocusKey: number;
  select: (id: string) => void;
  confirmAssignment: (claimId: string, adjusterName: string) => void;
  overrideRouting: (
    claimId: string,
    newAssignee: string,
    reasonCategory: OverrideReasonCategory,
    notes: string
  ) => void;
  escalateClaim: (claimId: string, target: string, reason: string) => void;
  requestDocuments: (claimId: string, channel: "sms" | "email" | "agent_callback") => void;
  showToast: (t: Omit<Toast, "id" | "ts">) => void;
  dismissToast: (id: string) => void;
  focusAuditTrail: () => void;
  startDemo: () => void;
  exitDemo: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  setDemoStep: (n: number) => void;
}

function nextId(prefix: string): string {
  return prefix + "-" + Math.random().toString(36).slice(2, 9).toUpperCase();
}

export const useWorkbench = create<WorkbenchState>((set, get) => ({
  claims: CLAIMS,
  selectedClaimId: CLAIMS[0].id,
  overrideLog: OVERRIDE_LOG,
  toasts: [],
  demoMode: { active: false, step: 1 },
  audiTrailFocusKey: 0,

  select: (id) => set({ selectedClaimId: id }),

  confirmAssignment: (claimId, adjusterName) => {
    set((s) => ({
      claims: s.claims.map((c) => {
        if (c.id !== claimId) return c;
        const entry: AuditEntry = {
          id: nextId("A"),
          ts: new Date().toISOString(),
          actor: "K. Hu (Adjuster Supervisor)",
          actorKind: "human",
          action: "Assignment confirmed",
          detail: `Routine recommendation accepted → ${adjusterName}`,
          decision: "human_confirmed",
        };
        return {
          ...c,
          state: "assigned",
          decision: {
            action: "confirmed",
            actor: "K. Hu",
            ts: new Date().toISOString(),
            note: `Confirmed routing to ${adjusterName}`,
          },
          activity: [...c.activity, entry],
        };
      }),
    }));
    get().showToast({
      kind: "good",
      title: "Assignment confirmed",
      body: `${adjusterName} · ClaimCenter assignment created · audit trail updated`,
    });
  },

  overrideRouting: (claimId, newAssignee, reasonCategory, notes) => {
    const label = REASON_LABELS[reasonCategory];
    set((s) => {
      const claim = s.claims.find((c) => c.id === claimId);
      const entry: AuditEntry = {
        id: nextId("A"),
        ts: new Date().toISOString(),
        actor: "K. Hu (Adjuster Supervisor)",
        actorKind: "human",
        action: "Routing overridden",
        detail: `→ ${newAssignee} · reason: ${label}${notes ? " — " + notes : ""}`,
        decision: "human_override",
      };
      const ovr: OverrideEvent = {
        id: nextId("OVR"),
        ts: new Date().toISOString(),
        claimId,
        actor: "K. Hu (Adjuster Supervisor)",
        fromRouting: claim?.routing.assigneeName ?? claim?.routing.decision ?? "—",
        toRouting: newAssignee,
        reason: notes ? `${label} — ${notes}` : label,
        reasonCategory,
        confidence: claim?.routing.confidence ?? 0,
        category:
          reasonCategory === "fraud_siu"
            ? "siu"
            : reasonCategory === "coverage_ambiguity"
            ? "coverage"
            : reasonCategory === "injury_severity"
            ? "complex"
            : "intake",
      };
      return {
        claims: s.claims.map((c) =>
          c.id === claimId
            ? {
                ...c,
                decision: {
                  action: "overridden",
                  actor: "K. Hu",
                  ts: new Date().toISOString(),
                  note: notes ? `${label} — ${notes}` : label,
                  reroutedTo: newAssignee,
                },
                state: "assigned",
                activity: [...c.activity, entry],
              }
            : c
        ),
        overrideLog: [ovr, ...s.overrideLog],
      };
    });
    get().showToast({
      kind: "warn",
      title: "Routing overridden",
      body: `Justification logged: ${label}. Compliance review queue updated.`,
    });
  },

  escalateClaim: (claimId, target, reason) => {
    set((s) => ({
      claims: s.claims.map((c) =>
        c.id === claimId
          ? {
              ...c,
              decision: {
                action: "escalated",
                actor: "K. Hu",
                ts: new Date().toISOString(),
                note: reason,
                reroutedTo: target,
              },
              activity: [
                ...c.activity,
                {
                  id: nextId("A"),
                  ts: new Date().toISOString(),
                  actor: "K. Hu (Adjuster Supervisor)",
                  actorKind: "human",
                  action: "Manual escalation",
                  detail: `Escalated to ${target} — ${reason}`,
                  decision: "escalated",
                },
              ],
            }
          : c
      ),
    }));
    get().showToast({
      kind: "crit",
      title: "Escalated",
      body: `${target} · reserve posting halted · audit trail updated`,
    });
  },

  requestDocuments: (claimId, channel) => {
    set((s) => ({
      claims: s.claims.map((c) =>
        c.id === claimId
          ? {
              ...c,
              activity: [
                ...c.activity,
                {
                  id: nextId("A"),
                  ts: new Date().toISOString(),
                  actor: "K. Hu (Adjuster Supervisor)",
                  actorKind: "human",
                  action: "Outbound document request",
                  detail: `Channel: ${channel.replace("_", " ")}. Recovery task dispatched.`,
                  decision: "human_confirmed",
                },
              ],
            }
          : c
      ),
    }));
    get().showToast({
      kind: "info",
      title: "Document request dispatched",
      body: `Channel: ${channel.replace("_", " ")} · recovery task open`,
    });
  },

  showToast: (t) => {
    const toast: Toast = { ...t, id: nextId("T"), ts: Date.now() };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== toast.id) }));
    }, 5200);
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  focusAuditTrail: () => set((s) => ({ audiTrailFocusKey: s.audiTrailFocusKey + 1 })),

  startDemo: () => set({ demoMode: { active: true, step: 1 } }),
  exitDemo: () => set({ demoMode: { active: false, step: 1 } }),
  nextDemoStep: () =>
    set((s) => ({
      demoMode: { active: true, step: Math.min(s.demoMode.step + 1, DEMO_STEPS.length) },
    })),
  prevDemoStep: () =>
    set((s) => ({
      demoMode: { active: true, step: Math.max(s.demoMode.step - 1, 1) },
    })),
  setDemoStep: (n) => set({ demoMode: { active: true, step: Math.max(1, Math.min(n, DEMO_STEPS.length)) } }),
}));

export const REASON_LABELS: Record<OverrideReasonCategory, string> = {
  missing_docs: "Missing documentation",
  coverage_ambiguity: "Coverage ambiguity",
  injury_severity: "Injury severity uncertainty",
  fraud_siu: "Fraud / SIU concern",
  customer_escalation: "Customer escalation",
  load_balancing: "Load balancing",
  conflict: "Adjuster conflict",
};

export { NOW_ISO };
