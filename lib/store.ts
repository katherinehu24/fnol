"use client";

import { create } from "zustand";
import { CLAIMS, NOW_ISO, OVERRIDE_LOG } from "./data";
import type { AuditEntry, Claim, OverrideEvent } from "./types";

interface WorkbenchState {
  claims: Claim[];
  selectedClaimId: string;
  overrideLog: OverrideEvent[];
  select: (id: string) => void;
  confirmAssignment: (claimId: string, adjusterName: string) => void;
  overrideRouting: (claimId: string, newAssignee: string, reason: string) => void;
  escalateClaim: (claimId: string, target: string, reason: string) => void;
  requestDocuments: (claimId: string, channel: "sms" | "email" | "agent_callback") => void;
}

function nextAuditId(): string {
  return "A-" + Math.random().toString(36).slice(2, 9).toUpperCase();
}

export const useWorkbench = create<WorkbenchState>((set) => ({
  claims: CLAIMS,
  selectedClaimId: CLAIMS[0].id,
  overrideLog: OVERRIDE_LOG,
  select: (id) => set({ selectedClaimId: id }),

  confirmAssignment: (claimId, adjusterName) =>
    set((s) => ({
      claims: s.claims.map((c) => {
        if (c.id !== claimId) return c;
        const entry: AuditEntry = {
          id: nextAuditId(),
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
    })),

  overrideRouting: (claimId, newAssignee, reason) =>
    set((s) => {
      const claim = s.claims.find((c) => c.id === claimId);
      const entry: AuditEntry = {
        id: nextAuditId(),
        ts: new Date().toISOString(),
        actor: "K. Hu (Adjuster Supervisor)",
        actorKind: "human",
        action: "Routing overridden",
        detail: `Reassigned to ${newAssignee} — ${reason}`,
        decision: "human_override",
      };
      const ovr: OverrideEvent = {
        id: "OVR-2026-00119",
        ts: new Date().toISOString(),
        claimId,
        actor: "K. Hu (Adjuster Supervisor)",
        fromRouting: claim?.routing.assigneeName ?? claim?.routing.decision ?? "—",
        toRouting: newAssignee,
        reason,
        confidence: claim?.routing.confidence ?? 0,
        category: "intake",
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
                  note: reason,
                  reroutedTo: newAssignee,
                },
                state: "assigned",
                activity: [...c.activity, entry],
              }
            : c
        ),
        overrideLog: [ovr, ...s.overrideLog],
      };
    }),

  escalateClaim: (claimId, target, reason) =>
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
                  id: nextAuditId(),
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
    })),

  requestDocuments: (claimId, channel) =>
    set((s) => ({
      claims: s.claims.map((c) =>
        c.id === claimId
          ? {
              ...c,
              activity: [
                ...c.activity,
                {
                  id: nextAuditId(),
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
    })),
}));

export { NOW_ISO };
