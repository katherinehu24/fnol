// Static model of the FNOL decision architecture.
// Five columns. Each column is a stage. Items inside a column are the discrete
// states/outcomes available at that stage. A "path" connects one item from each
// column — that path is what a claim traces through the system.

export type Stage = "channel" | "validation" | "confidence" | "routing" | "outcome";

export type HitlClass = "automated" | "review" | "escalated";

export interface LatticeNode {
  id: string;
  stage: Stage;
  label: string;
  sub?: string;
  hitl: HitlClass; // dot color
  metric?: string; // small metric pill — only where it carries weight
}

export const NODES: LatticeNode[] = [
  // 01 CHANNELS
  { id: "ch_portal", stage: "channel", label: "Web portal", sub: "claimant self-serve", hitl: "automated", metric: "58% of FNOL" },
  { id: "ch_ivr", stage: "channel", label: "Phone IVR", sub: "Genesys", hitl: "automated", metric: "22%" },
  { id: "ch_call", stage: "channel", label: "Call center", sub: "warm transfer", hitl: "review" },
  { id: "ch_agent", stage: "channel", label: "Agent submission", sub: "broker portal", hitl: "automated", metric: "14%" },
  { id: "ch_email", stage: "channel", label: "Email / docs", sub: "scanned intake", hitl: "review" },

  // 02 VALIDATION
  { id: "v_policy", stage: "validation", label: "Policy in-force", sub: "PolicyCenter bind", hitl: "automated" },
  { id: "v_claimant", stage: "validation", label: "Claimant identity", sub: "match policyholder / driver", hitl: "automated" },
  { id: "v_coverage", stage: "validation", label: "Coverage map", sub: "applies-to + deductible", hitl: "automated" },
  { id: "v_docs", stage: "validation", label: "Document set", sub: "extracted + completeness", hitl: "automated" },
  { id: "v_police", stage: "validation", label: "Police report", sub: "extract liability + citation", hitl: "automated" },
  { id: "v_severity", stage: "validation", label: "Severity estimate", sub: "damage zones + $ band", hitl: "automated" },
  { id: "v_injury", stage: "validation", label: "Injury detection", sub: "narrative + BI signals", hitl: "review" },
  { id: "v_fraud", stage: "validation", label: "Fraud indicators", sub: "14-rule SIU screen", hitl: "escalated" },
  { id: "v_state", stage: "validation", label: "State requirements", sub: "by jurisdiction · 50 profiles", hitl: "automated" },

  // 03 CONFIDENCE
  { id: "c_high", stage: "confidence", label: "High", sub: "≥ 0.85 · no SIU", hitl: "automated", metric: "72.4% of intakes" },
  { id: "c_med", stage: "confidence", label: "Medium", sub: "0.50 – 0.85", hitl: "review", metric: "18.7%" },
  { id: "c_low", stage: "confidence", label: "Low", sub: "< 0.50", hitl: "review", metric: "5.9%" },
  { id: "c_conflict", stage: "confidence", label: "Conflicting signals", sub: "narrative vs. photometric", hitl: "review" },
  { id: "c_incomplete", stage: "confidence", label: "Incomplete intake", sub: "missing required docs", hitl: "review" },
  { id: "c_ambig", stage: "confidence", label: "Policy ambiguity", sub: "permissive-use, lapse window", hitl: "review" },
  { id: "c_fraud", stage: "confidence", label: "Fraud suspicion", sub: "≥ 2 SIU indicators", hitl: "escalated", metric: "1.2%" },

  // 04 ROUTING
  { id: "r_fast", stage: "routing", label: "Fast Track", sub: "auto-assign Tier 1", hitl: "automated", metric: "72.4%" },
  { id: "r_human", stage: "routing", label: "Human Review", sub: "adjuster confirms", hitl: "review" },
  { id: "r_intake", stage: "routing", label: "Intake Recovery", sub: "outbound doc request", hitl: "review", metric: "9.1%" },
  { id: "r_super", stage: "routing", label: "Supervisor Queue", sub: "tier-band exceptions", hitl: "review" },
  { id: "r_complex", stage: "routing", label: "Complex Claims", sub: "multi-party · subrogation", hitl: "review" },
  { id: "r_siu", stage: "routing", label: "SIU Escalation", sub: "halt reserve · referral", hitl: "escalated", metric: "1.2%" },
  { id: "r_lit", stage: "routing", label: "Litigation Hold", sub: "demand letter / suit", hitl: "escalated" },
  { id: "r_comp", stage: "routing", label: "Compliance Escalation", sub: "regulator-sensitive", hitl: "escalated" },

  // 05 OUTCOME
  { id: "o_auto", stage: "outcome", label: "Auto-assign", sub: "ClaimCenter assignment created", hitl: "automated" },
  { id: "o_confirm", stage: "outcome", label: "Adjuster confirms", sub: "human-confirmed · audit logged", hitl: "review" },
  { id: "o_recovery", stage: "outcome", label: "Outbound recovery", sub: "SMS · email · agent callback", hitl: "review" },
  { id: "o_recon", stage: "outcome", label: "Manual reconciliation", sub: "senior · ambiguity resolution", hitl: "review" },
  { id: "o_alloc", stage: "outcome", label: "Multi-party allocation", sub: "subrogation parallel-tracked", hitl: "review" },
  { id: "o_siu", stage: "outcome", label: "SIU desk · halt reserve", sub: "no reserve until cleared", hitl: "escalated" },
  { id: "o_hold", stage: "outcome", label: "Hold notice", sub: "litigation / regulator queue", hitl: "escalated" },
  { id: "o_review", stage: "outcome", label: "Compliance review", sub: "Priya · weekly cadence", hitl: "escalated" },
];

export const STAGE_LABEL: Record<Stage, string> = {
  channel: "Channels",
  validation: "Validation",
  confidence: "Confidence",
  routing: "Routing",
  outcome: "Outcome",
};

export const STAGE_NUMBER: Record<Stage, string> = {
  channel: "01",
  validation: "02",
  confidence: "03",
  routing: "04",
  outcome: "05",
};

export const STAGE_KICKER: Record<Stage, string> = {
  channel: "How the claim arrives",
  validation: "What the Routine checks",
  confidence: "What the Routine concludes",
  routing: "Where the claim goes next",
  outcome: "What actually happens",
};

// Three traceable example paths — the 3 demo cases.
export interface SamplePath {
  id: string;
  claimId: string;
  label: string;
  shortLabel: string;
  tone: "good" | "warn" | "crit";
  nodes: string[]; // node ids in order, one per stage; channel/conf/routing/outcome single; validation can be multi
}

export const SAMPLE_PATHS: SamplePath[] = [
  {
    id: "clean",
    claimId: "CLM-2026-0451829",
    label: "Clean rear-end · Hannah Brennan · MA",
    shortLabel: "Clean → Fast Track",
    tone: "good",
    nodes: [
      "ch_portal",
      "v_policy", "v_claimant", "v_coverage", "v_docs", "v_police", "v_severity", "v_state",
      "c_high",
      "r_fast",
      "o_auto",
    ],
  },
  {
    id: "incomplete",
    claimId: "CLM-2026-0451814",
    label: "Incomplete intake · Daniel Ortiz · IL hit-and-run",
    shortLabel: "Incomplete → Intake Recovery",
    tone: "warn",
    nodes: [
      "ch_ivr",
      "v_policy", "v_claimant", "v_coverage", "v_state",
      "c_incomplete",
      "r_intake",
      "o_recovery",
    ],
  },
  {
    id: "fraud",
    claimId: "CLM-2026-0451780",
    label: "Fraud-risk · Marcus Hale · FL total loss",
    shortLabel: "Fraud signals → SIU",
    tone: "crit",
    nodes: [
      "ch_portal",
      "v_policy", "v_claimant", "v_coverage", "v_docs", "v_severity", "v_fraud", "v_state",
      "c_fraud",
      "r_siu",
      "o_siu",
    ],
  },
];

// HITL checkpoints — explicit table.
export interface HitlCheckpoint {
  id: string;
  where: string;
  trigger: string;
  action: string;
  justification: "always" | "if_override" | "none";
  ownership: string;
}

export const HITL_CHECKPOINTS: HitlCheckpoint[] = [
  {
    id: "h1",
    where: "Routing v3.0 · confidence < 0.85",
    trigger: "Any sub-threshold routing recommendation",
    action: "Surface to Adjuster Workbench supervisor — confirm, override, or escalate",
    justification: "if_override",
    ownership: "Operations · supervisor",
  },
  {
    id: "h2",
    where: "Coverage Map v2.1 · ambiguity flagged",
    trigger: "Permissive-use, lapse window, multi-jurisdictional endorsement",
    action: "Route to Senior Review queue — manual interpretation",
    justification: "if_override",
    ownership: "Senior adjusters",
  },
  {
    id: "h3",
    where: "SIU Screen v1.2 · ≥ 2 indicators",
    trigger: "Rule-based fraud indicator engine",
    action: "Halt auto-routing · halt reserve posting · page SIU desk",
    justification: "always",
    ownership: "Compliance · SIU",
  },
  {
    id: "h4",
    where: "Intake Recovery v1.1 · 72h timeout",
    trigger: "Outbound recovery dispatched but no claimant response",
    action: "Escalate to senior review · manual intake build",
    justification: "none",
    ownership: "Operations · supervisor",
  },
  {
    id: "h5",
    where: "Any human override",
    trigger: "Adjuster reassigns or changes routing",
    action: "Capture written justification · log to override register",
    justification: "always",
    ownership: "Compliance · weekly review",
  },
  {
    id: "h6",
    where: "Litigation / regulator flag",
    trigger: "Demand letter, subpoena, DOI inquiry detected in correspondence",
    action: "Hold notice · halt automation · escalate to compliance",
    justification: "always",
    ownership: "Compliance · legal",
  },
];

// Threshold rules — Compliance-owned, versioned.
export interface ThresholdRule {
  id: string;
  cls: string;
  threshold: string;
  below: string;
  lastChanged: string;
  owner: string;
}

export const THRESHOLD_RULES: ThresholdRule[] = [
  { id: "t1", cls: "Fast Track auto-assign", threshold: "≥ 0.85 confidence · no SIU", below: "Human Review", lastChanged: "2026-05-12", owner: "Compliance · P. Raman" },
  { id: "t2", cls: "Auto-confirm without supervisor", threshold: "≥ 0.92 · clean intake", below: "Supervisor sign-off", lastChanged: "2026-05-12", owner: "Compliance · P. Raman" },
  { id: "t3", cls: "Senior review (coverage)", threshold: "≥ 0.70 · ambiguity flagged", below: "Manual reconciliation", lastChanged: "2026-05-12", owner: "Compliance · P. Raman" },
  { id: "t4", cls: "Intake recovery dispatch", threshold: "any missing required doc", below: "72h timeout → escalate", lastChanged: "2026-04-22", owner: "IT · D. Okafor" },
  { id: "t5", cls: "SIU referral (rule-based)", threshold: "≥ 2 indicators · or photometric inconsistency", below: "Halt reserve · escalate", lastChanged: "2026-04-08", owner: "Compliance · P. Raman" },
  { id: "t6", cls: "Litigation hold", threshold: "Demand letter / subpoena detected", below: "Immediate hold notice", lastChanged: "2026-03-14", owner: "Compliance · legal" },
];

// Exception taxonomy.
export interface ExceptionTaxonomyItem {
  id: string;
  name: string;
  trigger: string;
  destination: string;
  owner: string;
  share: number; // share of all exceptions
}

export const EXCEPTION_TAXONOMY: ExceptionTaxonomyItem[] = [
  { id: "e1", name: "Missing documents", trigger: "Required document absent · state-specific", destination: "Intake Recovery", owner: "Recovery routine", share: 0.34 },
  { id: "e2", name: "Contradictory information", trigger: "Narrative vs. photometric · vs. police report", destination: "Senior Review", owner: "Senior adjuster", share: 0.09 },
  { id: "e3", name: "Policy lapse ambiguity", trigger: "Declarations show lapsed · payment unconfirmed", destination: "Human Review", owner: "Adjuster supervisor", share: 0.08 },
  { id: "e4", name: "Injury escalation", trigger: "BI signals detected in intake", destination: "BI Desk handoff", owner: "BI desk", share: 0.07 },
  { id: "e5", name: "Fraud indicators", trigger: "≥ 2 SIU rules triggered", destination: "SIU Escalation", owner: "P. Iyer (SIU)", share: 0.14 },
  { id: "e6", name: "Compliance-sensitive", trigger: "DOI inquiry · regulator flag · litigation", destination: "Compliance Escalation", owner: "Compliance · legal", share: 0.04 },
  { id: "e7", name: "Edge-case routing failure", trigger: "Confidence anomaly · no matched bucket", destination: "Supervisor Queue", owner: "Adjuster supervisor", share: 0.03 },
  { id: "e8", name: "Reroute", trigger: "Human override changes routing class", destination: "Per override target", owner: "Adjuster (audited)", share: 0.16 },
  { id: "e9", name: "Customer escalation", trigger: "Claimant requests supervisor / executive", destination: "Supervisor Queue", owner: "Adjuster supervisor", share: 0.05 },
];

// The 8 operational metrics — definitions attached to each.
export interface MetricDef {
  id: string;
  label: string;
  value: string;
  baseline: string;
  definition: string;
  intent: "good" | "neutral" | "warn";
}

export const METRIC_DEFS: MetricDef[] = [
  { id: "m1", label: "FNOL → assignment", value: "14m", baseline: "3h 01m", definition: "Median minutes from FNOL receipt to first-adjuster-action.", intent: "good" },
  { id: "m2", label: "Reroute rate", value: "3.1%", baseline: "5.0%", definition: "Share of claims whose routing class changes after initial assignment.", intent: "good" },
  { id: "m3", label: "Override rate", value: "6.8%", baseline: "—", definition: "Share of Routine recommendations changed by a human. SLA band 5–10%.", intent: "neutral" },
  { id: "m4", label: "Backlog aging (p90)", value: "41m", baseline: "4h 12m", definition: "P90 age of open intakes, all states.", intent: "good" },
  { id: "m5", label: "Touches per claim", value: "1.4", baseline: "4.2", definition: "Mean human touches required per claim before resolution.", intent: "good" },
  { id: "m6", label: "Adjuster-minutes saved", value: "37m / claim", baseline: "—", definition: "Manual assembly minutes removed. Baseline-anchored.", intent: "good" },
  { id: "m7", label: "Exception volume", value: "9.4%", baseline: "11.8%", definition: "Share of claims leaving the auto-route path for any reason.", intent: "good" },
  { id: "m8", label: "SIU escalation rate", value: "1.2%", baseline: "0.9%", definition: "Share of claims referred to SIU desk via rule engine.", intent: "neutral" },
];
