"use client";

import { Panel, Pill, DataRow, IconDot } from "@/components/ui/primitives";
import { formatMoney, formatRelative } from "@/lib/format";
import { NOW_ISO } from "@/lib/data";
import type { Claim } from "@/lib/types";
import { DocumentsBlock } from "./DocumentsBlock";
import { PoliceReportExtract } from "./PoliceReportExtract";
import { CoverageBlock } from "./CoverageBlock";
import { PhotosBlock } from "./PhotosBlock";
import { ActivityTimeline } from "./ActivityTimeline";

export function ClaimDetail({ claim }: { claim: Claim }) {
  return (
    <div className="overflow-y-auto p-3 space-y-3 bg-ink-900">
      <ClaimHeader claim={claim} />
      <div className="grid grid-cols-2 gap-3">
        <ClaimantPolicyPanel claim={claim} />
        <LossPanel claim={claim} />
      </div>
      <DocumentsBlock claim={claim} />
      {claim.policeReport && <PoliceReportExtract report={claim.policeReport} />}
      <CoverageBlock claim={claim} />
      <PhotosBlock claim={claim} />
      <ActivityTimeline claim={claim} />
    </div>
  );
}

function ClaimHeader({ claim }: { claim: Claim }) {
  const stateBadge = stateMeta(claim.state);
  return (
    <div className="panel">
      <div className="px-3 py-2.5 flex items-start justify-between gap-4 border-b border-ink-700">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[14px] text-ink-50">{claim.id}</span>
            <Pill tone={stateBadge.tone}>{stateBadge.label}</Pill>
            {claim.decision && (
              <Pill tone={claim.decision.action === "confirmed" ? "good" : claim.decision.action === "overridden" ? "warn" : "crit"}>
                {claim.decision.action === "confirmed"
                  ? "Assignment confirmed"
                  : claim.decision.action === "overridden"
                  ? "Routing overridden"
                  : "Escalated"}
              </Pill>
            )}
          </div>
          <div className="text-[13px] text-ink-100">
            {claim.claimant.name} · {claim.loss.type.replace("_", " ")} · {claim.loss.locationCity}, {claim.loss.locationState}
          </div>
          <div className="text-2xs text-ink-400 mt-0.5">
            Policy <span className="font-mono text-ink-200">{claim.policy.number}</span> · FNOL {formatRelative(claim.receivedAt, NOW_ISO)} · Received via {claim.reportedVia.replace("_", " ")}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xs text-ink-400 uppercase tracking-wider">Reserve estimate</div>
          <div className="text-[20px] font-medium text-ink-50 leading-none mt-1">
            {formatMoney(claim.coverageSummary.reserveEstimate)}
          </div>
          <div className="text-2xs text-ink-400 mt-1">
            Damage est. {formatMoney(claim.loss.estimatedDamage)}
          </div>
        </div>
      </div>
      <div className="px-3 py-2 flex items-center gap-4 text-2xs text-ink-300">
        <span className="flex items-center gap-1.5">
          <IconDot tone={claim.policy.inForce ? "good" : "crit"} />
          Policy {claim.policy.inForce ? "in force" : "lapsed / pending"}
        </span>
        <span>·</span>
        <span className="flex items-center gap-1.5">
          <IconDot tone={claim.loss.drivable ? "good" : "warn"} />
          {claim.loss.drivable ? "Drivable" : "Not drivable"}
        </span>
        <span>·</span>
        <span className="flex items-center gap-1.5">
          <IconDot tone={claim.loss.injuries ? "warn" : "good"} />
          {claim.loss.injuries ? "Injury reported (BI desk separate)" : "No injury reported"}
        </span>
        <span>·</span>
        <span>Other vehicles: <span className="text-ink-100">{claim.loss.otherVehicles}</span></span>
      </div>
    </div>
  );
}

function ClaimantPolicyPanel({ claim }: { claim: Claim }) {
  return (
    <Panel title="Claimant · Policy" subtitle="from PolicyCenter">
      <div className="grid grid-cols-2 gap-x-6 gap-y-0">
        <DataRow label="Name" value={claim.claimant.name} />
        <DataRow label="Policy #" value={claim.policy.number} mono />
        <DataRow label="State" value={claim.claimant.state} />
        <DataRow label="In force" value={claim.policy.inForce ? "Yes" : <span className="text-amber">Pending</span>} />
        <DataRow label="Phone" value={claim.claimant.phone} mono />
        <DataRow label="Effective" value={claim.policy.effectiveDate} mono />
        <DataRow label="Email" value={claim.claimant.email} />
        <DataRow label="Expiration" value={claim.policy.expirationDate} mono />
        <DataRow label="Policyholder" value={claim.claimant.policyholder ? "Yes (named)" : "No (driver only)"} />
        <DataRow label="Product" value={claim.policy.product} />
      </div>
      {claim.policy.notes && (
        <div className="mt-2 px-2 py-1.5 bg-amber-900/30 border border-amber/30 rounded-sm text-[12px] text-amber">
          {claim.policy.notes}
        </div>
      )}
    </Panel>
  );
}

function LossPanel({ claim }: { claim: Claim }) {
  return (
    <Panel title="Loss details" subtitle={`Loss date ${claim.lossDate}`}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-0">
        <DataRow label="Type" value={claim.loss.type.replace("_", " ")} />
        <DataRow label="Damage est." value={formatMoney(claim.loss.estimatedDamage)} mono />
        <DataRow label="Location" value={`${claim.loss.locationCity}, ${claim.loss.locationState}`} />
        <DataRow label="Drivable" value={claim.loss.drivable ? "Yes" : "No"} />
        <DataRow label="Injuries" value={claim.loss.injuries ? "Yes" : "No"} />
        <DataRow label="Other vehicles" value={String(claim.loss.otherVehicles)} mono />
      </div>
      <div className="mt-2 text-[12.5px] text-ink-100 leading-relaxed">
        {claim.loss.description}
      </div>
    </Panel>
  );
}

function stateMeta(state: Claim["state"]): { label: string; tone: "good" | "warn" | "crit" | "info" | "neutral" } {
  switch (state) {
    case "ready_to_assign":
      return { label: "Ready to assign", tone: "good" };
    case "missing_documents":
      return { label: "Intake recovery", tone: "warn" };
    case "coverage_review":
      return { label: "Coverage review", tone: "info" };
    case "siu_escalation":
      return { label: "SIU escalation", tone: "crit" };
    case "complex_loss":
      return { label: "Complex loss", tone: "warn" };
    case "assigned":
      return { label: "Assigned", tone: "neutral" };
    default:
      return { label: state, tone: "neutral" };
  }
}
