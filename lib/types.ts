export type ClaimState =
  | "ready_to_assign"
  | "missing_documents"
  | "coverage_review"
  | "siu_escalation"
  | "complex_loss"
  | "assigned"
  | "in_progress";

export type RoutingDecision =
  | "auto_assign"
  | "intake_recovery"
  | "senior_review"
  | "compliance_escalation"
  | "manual_reconciliation";

export type AdjusterTier = "fast_track" | "general" | "senior" | "siu";

export interface Adjuster {
  id: string;
  name: string;
  tier: AdjusterTier;
  team: string;
  load: number; // open claims
  capacity: number;
  avgCycleHrs: number;
}

export interface DocumentItem {
  id: string;
  type:
    | "police_report"
    | "photos"
    | "policy_declaration"
    | "loss_statement"
    | "estimate"
    | "drivers_license"
    | "tow_invoice";
  label: string;
  status: "received" | "extracted" | "missing" | "low_confidence";
  receivedAt?: string;
  extractedFields?: Record<string, string>;
  pageCount?: number;
}

export interface AuditEntry {
  id: string;
  ts: string; // ISO
  actor: string; // adjuster name or "Routine: FNOL Intake v3"
  actorKind: "human" | "routine" | "system";
  action: string;
  detail?: string;
  decision?: "automated" | "human_confirmed" | "human_override" | "escalated";
}

export interface RoutingRecommendation {
  decision: RoutingDecision;
  assigneeId?: string;
  assigneeName?: string;
  assigneeTier?: AdjusterTier;
  confidence: number; // 0-1
  threshold: number; // 0-1 — confidence threshold for auto-assignment of this routing class
  rationale: string[];
  alternates?: Array<{ assigneeId: string; assigneeName: string; load: number }>;
  blockers?: string[];
}

export interface Claim {
  id: string;
  state: ClaimState;
  receivedAt: string;
  lossDate: string;
  reportedVia: "online_portal" | "agent" | "phone_ivr" | "telematics";
  fnolMinutes: number; // minutes since FNOL received
  claimant: {
    name: string;
    phone: string;
    email: string;
    state: string;
    policyholder: boolean;
  };
  policy: {
    number: string;
    product: "Auto PD";
    effectiveDate: string;
    expirationDate: string;
    inForce: boolean;
    coverages: Array<{ code: string; label: string; limit: string; deductible?: string }>;
    notes?: string;
  };
  loss: {
    type: "rear_end" | "intersection" | "parking_lot" | "single_vehicle" | "multi_vehicle" | "weather";
    description: string;
    locationCity: string;
    locationState: string;
    estimatedDamage: number;
    drivable: boolean;
    injuries: boolean;
    otherVehicles: number;
  };
  documents: DocumentItem[];
  photos: Array<{ id: string; label: string; damageZone: string; severity: "minor" | "moderate" | "severe" }>;
  policeReport?: {
    reportNumber: string;
    department: string;
    atFault?: "claimant" | "other_party" | "unclear";
    citationIssued: boolean;
    narrativeSummary: string;
    confidence: number;
  };
  coverageSummary: {
    appliesTo: string[]; // coverage codes that apply
    ambiguities: string[];
    reserveEstimate: number;
  };
  routing: RoutingRecommendation;
  siuFlags?: string[];
  activity: AuditEntry[];
  // Demo-only state mutations
  decision?: {
    action: "confirmed" | "overridden" | "escalated";
    actor: string;
    ts: string;
    note?: string;
    reroutedTo?: string;
  };
}

export interface MetricSnapshot {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  intent?: "good" | "warn" | "bad" | "neutral";
  sub?: string;
}

export interface QueueBucket {
  label: string;
  state: ClaimState;
  count: number;
  agingP50Min: number;
  agingP90Min: number;
  slaRisk: number; // 0-1
}

export interface Exception {
  id: string;
  claimId: string;
  category: "missing_doc" | "coverage_ambiguity" | "siu_indicator" | "complex_loss" | "third_party";
  detail: string;
  openedAt: string;
  owner: string;
  ageMin: number;
}

export interface OverrideEvent {
  id: string;
  ts: string;
  claimId: string;
  actor: string;
  fromRouting: string;
  toRouting: string;
  reason: string;
  confidence: number;
  category: "intake" | "coverage" | "siu" | "complex";
}

export interface IntegrationNode {
  id: string;
  label: string;
  kind: "system_of_record" | "data_source" | "channel" | "routine" | "downstream";
  status: "healthy" | "degraded" | "offline";
  lastSync: string;
  notes?: string;
}
