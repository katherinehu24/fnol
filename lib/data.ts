import type {
  Adjuster,
  Claim,
  Exception,
  IntegrationNode,
  MetricSnapshot,
  OverrideEvent,
  QueueBucket,
} from "./types";

export const ADJUSTERS: Adjuster[] = [
  { id: "ADJ-1041", name: "Renee Whitford", tier: "fast_track", team: "Auto PD — Fast Track A", load: 38, capacity: 55, avgCycleHrs: 4.1 },
  { id: "ADJ-1052", name: "Marcus Tilden", tier: "fast_track", team: "Auto PD — Fast Track A", load: 47, capacity: 55, avgCycleHrs: 4.8 },
  { id: "ADJ-1078", name: "Linh Nguyen", tier: "general", team: "Auto PD — General East", load: 31, capacity: 45, avgCycleHrs: 9.2 },
  { id: "ADJ-1090", name: "Devon Pritchard", tier: "general", team: "Auto PD — General East", load: 42, capacity: 45, avgCycleHrs: 10.7 },
  { id: "ADJ-1112", name: "Sarah Kowalski", tier: "senior", team: "Auto PD — Senior Review", load: 18, capacity: 25, avgCycleHrs: 22.4 },
  { id: "ADJ-1118", name: "Jamal Forrester", tier: "senior", team: "Auto PD — Senior Review", load: 21, capacity: 25, avgCycleHrs: 24.1 },
  { id: "ADJ-1140", name: "Priya Iyer", tier: "siu", team: "SIU — Auto", load: 9, capacity: 14, avgCycleHrs: 71.0 },
];

const adjusterById = Object.fromEntries(ADJUSTERS.map(a => [a.id, a]));

function ts(offsetMin: number): string {
  // anchor to a fixed "now" so screenshots are stable across reloads
  const now = new Date("2026-05-21T14:32:00-04:00");
  return new Date(now.getTime() - offsetMin * 60_000).toISOString();
}

export const NOW_ISO = "2026-05-21T14:32:00-04:00";

const CLAIM_READY: Claim = {
  id: "CLM-2026-0451829",
  state: "ready_to_assign",
  receivedAt: ts(11),
  lossDate: "2026-05-20",
  reportedVia: "online_portal",
  fnolMinutes: 11,
  claimant: {
    name: "Hannah Brennan",
    phone: "(617) 555-0148",
    email: "h.brennan@example.com",
    state: "MA",
    policyholder: true,
  },
  policy: {
    number: "NBM-AP-77419-22",
    product: "Auto PD",
    effectiveDate: "2025-09-01",
    expirationDate: "2026-09-01",
    inForce: true,
    coverages: [
      { code: "COLL", label: "Collision", limit: "ACV", deductible: "$500" },
      { code: "PD", label: "Property Damage Liability", limit: "$100,000" },
      { code: "RENTAL", label: "Rental Reimbursement", limit: "$45/day · 30 days" },
    ],
  },
  loss: {
    type: "rear_end",
    description: "Insured rear-ended at signalized intersection on Mass Ave at Beacon St. Other party stopped at red.",
    locationCity: "Cambridge",
    locationState: "MA",
    estimatedDamage: 6840,
    drivable: true,
    injuries: false,
    otherVehicles: 1,
  },
  documents: [
    { id: "DOC-1", type: "policy_declaration", label: "Policy declarations (pulled)", status: "extracted", receivedAt: ts(11), pageCount: 4 },
    { id: "DOC-2", type: "police_report", label: "Cambridge PD report #26-19044", status: "extracted", receivedAt: ts(9), pageCount: 3 },
    { id: "DOC-3", type: "photos", label: "Damage photos (claimant upload, 6)", status: "extracted", receivedAt: ts(10) },
    { id: "DOC-4", type: "drivers_license", label: "Driver's license (claimant)", status: "extracted", receivedAt: ts(11) },
    { id: "DOC-5", type: "loss_statement", label: "Recorded loss statement", status: "extracted", receivedAt: ts(8) },
  ],
  photos: [
    { id: "P1", label: "Rear bumper, driver side", damageZone: "Rear bumper", severity: "moderate" },
    { id: "P2", label: "Rear bumper, passenger side", damageZone: "Rear bumper", severity: "moderate" },
    { id: "P3", label: "Trunk lid", damageZone: "Trunk", severity: "minor" },
    { id: "P4", label: "Tail light, driver", damageZone: "Tail light L", severity: "minor" },
    { id: "P5", label: "Wide shot, vehicle", damageZone: "Wide", severity: "moderate" },
    { id: "P6", label: "Other party plate + VIN visible", damageZone: "Other party", severity: "minor" },
  ],
  policeReport: {
    reportNumber: "CPD-26-19044",
    department: "Cambridge Police Department",
    atFault: "other_party",
    citationIssued: true,
    narrativeSummary:
      "Unit 1 (insured) was stopped at a red signal on Mass Ave at Beacon St. Unit 2 failed to stop and struck Unit 1 in the rear. Citation issued to Unit 2 operator (failure to stop). No injuries reported on scene.",
    confidence: 0.97,
  },
  coverageSummary: {
    appliesTo: ["COLL", "PD", "RENTAL"],
    ambiguities: [],
    reserveEstimate: 7400,
  },
  routing: {
    decision: "auto_assign",
    assigneeId: "ADJ-1041",
    assigneeName: "Renee Whitford",
    assigneeTier: "fast_track",
    confidence: 0.94,
    threshold: 0.85,
    rationale: [
      "Single-vehicle rear-end, clear liability per police report (citation issued to other party).",
      "All intake documents extracted: police report, photos, loss statement, declarations.",
      "Damage estimate $6,840 — within Fast Track band ($1.5k–$15k).",
      "No injury, vehicle drivable, no third-party complications.",
      "Coverage clean: COLL applies, deductible $500. PD reserve recommended on other party.",
    ],
    alternates: [
      { assigneeId: "ADJ-1052", assigneeName: "Marcus Tilden", load: 47 },
      { assigneeId: "ADJ-1078", assigneeName: "Linh Nguyen", load: 31 },
    ],
  },
  activity: [
    { id: "A1", ts: ts(11), actor: "FNOL Intake", actorKind: "system", action: "FNOL received", detail: "Online portal · session 8f31c" },
    { id: "A2", ts: ts(11), actor: "Routine: FNOL Intake v3.2", actorKind: "routine", action: "Policy bound", detail: "Policy NBM-AP-77419-22 — in force", decision: "automated" },
    { id: "A3", ts: ts(10), actor: "Routine: Doc Extraction v2.4", actorKind: "routine", action: "Photos extracted", detail: "6 images, damage zones identified", decision: "automated" },
    { id: "A4", ts: ts(10), actor: "Routine: Police Report Parse v1.8", actorKind: "routine", action: "Police report received", detail: "CPD #26-19044 · liability extracted at 0.97 confidence", decision: "automated" },
    { id: "A5", ts: ts(9), actor: "Routine: Coverage Map v2.1", actorKind: "routine", action: "Coverage applied", detail: "COLL, PD, RENTAL — no ambiguity", decision: "automated" },
    { id: "A6", ts: ts(9), actor: "Routine: Routing v3.0", actorKind: "routine", action: "Routing recommendation", detail: "Auto-assign → Renee Whitford (Fast Track A) at 0.94 confidence", decision: "automated" },
  ],
};

const CLAIM_MISSING_DOC: Claim = {
  id: "CLM-2026-0451814",
  state: "missing_documents",
  receivedAt: ts(43),
  lossDate: "2026-05-19",
  reportedVia: "phone_ivr",
  fnolMinutes: 43,
  claimant: {
    name: "Daniel Ortiz",
    phone: "(312) 555-0192",
    email: "dortiz81@example.com",
    state: "IL",
    policyholder: true,
  },
  policy: {
    number: "NBM-AP-66201-19",
    product: "Auto PD",
    effectiveDate: "2025-04-15",
    expirationDate: "2026-04-15",
    inForce: false,
    notes: "Policy expired 36 days prior to reported loss. Pending: confirm renewal payment timing.",
    coverages: [
      { code: "COLL", label: "Collision", limit: "ACV", deductible: "$1,000" },
      { code: "PD", label: "Property Damage Liability", limit: "$50,000" },
    ],
  },
  loss: {
    type: "parking_lot",
    description: "Vehicle struck by unknown party in retail parking lot. Hit-and-run.",
    locationCity: "Chicago",
    locationState: "IL",
    estimatedDamage: 3200,
    drivable: true,
    injuries: false,
    otherVehicles: 1,
  },
  documents: [
    { id: "DOC-1", type: "policy_declaration", label: "Policy declarations", status: "extracted", receivedAt: ts(43), pageCount: 4 },
    { id: "DOC-2", type: "photos", label: "Damage photos (claimant, 2)", status: "low_confidence", receivedAt: ts(40) },
    { id: "DOC-3", type: "police_report", label: "Police report", status: "missing" },
    { id: "DOC-4", type: "loss_statement", label: "Recorded loss statement", status: "missing" },
  ],
  photos: [
    { id: "P1", label: "Driver door — angle 1", damageZone: "Driver door", severity: "moderate" },
    { id: "P2", label: "Driver door — angle 2 (blurry)", damageZone: "Driver door", severity: "moderate" },
  ],
  coverageSummary: {
    appliesTo: ["COLL"],
    ambiguities: [
      "Policy shows lapsed on declarations date. Renewal payment status not confirmed from system of record.",
      "Hit-and-run requires police report for COLL deductible waiver consideration (IL statute).",
    ],
    reserveEstimate: 0,
  },
  routing: {
    decision: "intake_recovery",
    confidence: 0.42,
    threshold: 0.85,
    rationale: [
      "Police report missing — required for hit-and-run COLL processing under IL statute.",
      "Recorded loss statement not yet captured — IVR transfer dropped at 02:14.",
      "Photo set incomplete (2 of expected 4+) and one image flagged blurry.",
      "Policy in-force status ambiguous: declarations show lapsed but renewal payment timing unconfirmed.",
    ],
    blockers: [
      "Police report (required)",
      "Loss statement (required)",
      "Renewal payment confirmation from PolicyCenter",
    ],
  },
  activity: [
    { id: "A1", ts: ts(43), actor: "FNOL Intake", actorKind: "system", action: "FNOL received", detail: "Phone IVR · call 7e22a · transferred mid-call" },
    { id: "A2", ts: ts(43), actor: "Routine: FNOL Intake v3.2", actorKind: "routine", action: "Policy lookup", detail: "Policy NBM-AP-66201-19 — declarations show expired", decision: "automated" },
    { id: "A3", ts: ts(41), actor: "Routine: Doc Extraction v2.4", actorKind: "routine", action: "Photos extracted (partial)", detail: "2 images, 1 flagged low confidence", decision: "automated" },
    { id: "A4", ts: ts(40), actor: "Routine: Routing v3.0", actorKind: "routine", action: "Routing held — intake recovery", detail: "Confidence 0.42 below 0.85 threshold. Outbound recovery task created.", decision: "escalated" },
    { id: "A5", ts: ts(38), actor: "Routine: Intake Recovery v1.1", actorKind: "routine", action: "Outbound SMS dispatched", detail: "Document upload link sent to (312) 555-0192", decision: "automated" },
  ],
};

const CLAIM_COVERAGE: Claim = {
  id: "CLM-2026-0451802",
  state: "coverage_review",
  receivedAt: ts(124),
  lossDate: "2026-05-19",
  reportedVia: "agent",
  fnolMinutes: 124,
  claimant: {
    name: "Olivia Reyes",
    phone: "(214) 555-0167",
    email: "olivia.reyes@example.com",
    state: "TX",
    policyholder: false,
  },
  policy: {
    number: "NBM-AP-58820-23",
    product: "Auto PD",
    effectiveDate: "2025-11-01",
    expirationDate: "2026-11-01",
    inForce: true,
    notes: "Named insured is parent. Claimant is listed household driver. Permissive-use question on garaging.",
    coverages: [
      { code: "COLL", label: "Collision", limit: "ACV", deductible: "$500" },
      { code: "PD", label: "Property Damage Liability", limit: "$100,000" },
      { code: "UMPD", label: "Uninsured Motorist PD", limit: "$25,000" },
    ],
  },
  loss: {
    type: "intersection",
    description: "Claimant operating named-insured's vehicle. T-bone at unsignaled intersection in Plano. Other party fled.",
    locationCity: "Plano",
    locationState: "TX",
    estimatedDamage: 11400,
    drivable: false,
    injuries: false,
    otherVehicles: 1,
  },
  documents: [
    { id: "DOC-1", type: "policy_declaration", label: "Policy declarations", status: "extracted", receivedAt: ts(124), pageCount: 5 },
    { id: "DOC-2", type: "police_report", label: "Plano PD report #26-7720", status: "extracted", receivedAt: ts(110), pageCount: 4 },
    { id: "DOC-3", type: "photos", label: "Damage photos (8)", status: "extracted", receivedAt: ts(112) },
    { id: "DOC-4", type: "loss_statement", label: "Recorded loss statement", status: "received", receivedAt: ts(105) },
    { id: "DOC-5", type: "tow_invoice", label: "Tow invoice", status: "extracted", receivedAt: ts(100) },
  ],
  photos: [
    { id: "P1", label: "Driver side crush", damageZone: "Driver door + B-pillar", severity: "severe" },
    { id: "P2", label: "Driver rear quarter", damageZone: "Rear quarter L", severity: "severe" },
    { id: "P3", label: "Wheel/suspension", damageZone: "Suspension L", severity: "severe" },
  ],
  policeReport: {
    reportNumber: "PPD-26-7720",
    department: "Plano Police Department",
    atFault: "other_party",
    citationIssued: false,
    narrativeSummary:
      "Unit 1 (claimant) westbound on Park Blvd. Unit 2 northbound on Custer Rd disregarded stop sign and struck Unit 1. Unit 2 left scene. No suspect vehicle identified.",
    confidence: 0.91,
  },
  coverageSummary: {
    appliesTo: ["COLL", "UMPD"],
    ambiguities: [
      "Driver is permissive-use household member, not named insured. Confirm permissive-use scope under TX endorsement.",
      "Hit-and-run with no suspect vehicle. UMPD potentially applies but requires verified physical contact (satisfied).",
    ],
    reserveEstimate: 12200,
  },
  routing: {
    decision: "senior_review",
    assigneeId: "ADJ-1112",
    assigneeName: "Sarah Kowalski",
    assigneeTier: "senior",
    confidence: 0.71,
    threshold: 0.85,
    rationale: [
      "Permissive-use coverage question requires manual interpretation — not in Routine v3.0 scope.",
      "UMPD versus COLL deductible election material to claimant — requires adjuster judgment.",
      "Damage $11.4k above Fast Track band, severity flagged severe on driver-side crush.",
      "All other intake elements complete; routing held only on coverage ambiguity.",
    ],
    alternates: [
      { assigneeId: "ADJ-1118", assigneeName: "Jamal Forrester", load: 21 },
    ],
  },
  activity: [
    { id: "A1", ts: ts(124), actor: "FNOL Intake", actorKind: "system", action: "FNOL received", detail: "Agent submission · agent 4082" },
    { id: "A2", ts: ts(124), actor: "Routine: FNOL Intake v3.2", actorKind: "routine", action: "Policy bound", detail: "Policy NBM-AP-58820-23 — in force", decision: "automated" },
    { id: "A3", ts: ts(118), actor: "Routine: Doc Extraction v2.4", actorKind: "routine", action: "Documents extracted", detail: "Police report, photos, tow invoice", decision: "automated" },
    { id: "A4", ts: ts(108), actor: "Routine: Coverage Map v2.1", actorKind: "routine", action: "Ambiguity flagged", detail: "Permissive-use + UMPD election", decision: "escalated" },
    { id: "A5", ts: ts(105), actor: "Routine: Routing v3.0", actorKind: "routine", action: "Routing → senior review", detail: "Confidence 0.71. Senior Review queue. Recommended: Sarah Kowalski.", decision: "escalated" },
  ],
};

const CLAIM_SIU: Claim = {
  id: "CLM-2026-0451780",
  state: "siu_escalation",
  receivedAt: ts(216),
  lossDate: "2026-05-17",
  reportedVia: "online_portal",
  fnolMinutes: 216,
  claimant: {
    name: "Marcus Hale",
    phone: "(305) 555-0119",
    email: "mhale.fl@example.com",
    state: "FL",
    policyholder: true,
  },
  policy: {
    number: "NBM-AP-44012-25",
    product: "Auto PD",
    effectiveDate: "2026-03-22",
    expirationDate: "2027-03-22",
    inForce: true,
    notes: "Policy bound 28 days prior to reported loss.",
    coverages: [
      { code: "COLL", label: "Collision", limit: "ACV", deductible: "$1,000" },
      { code: "PD", label: "Property Damage Liability", limit: "$50,000" },
    ],
  },
  loss: {
    type: "single_vehicle",
    description: "Single-vehicle, struck fixed object late at night. No witnesses, no other party. Claimed total loss.",
    locationCity: "Miami",
    locationState: "FL",
    estimatedDamage: 18900,
    drivable: false,
    injuries: false,
    otherVehicles: 0,
  },
  documents: [
    { id: "DOC-1", type: "policy_declaration", label: "Policy declarations", status: "extracted", receivedAt: ts(216), pageCount: 4 },
    { id: "DOC-2", type: "photos", label: "Damage photos (12)", status: "extracted", receivedAt: ts(210) },
    { id: "DOC-3", type: "loss_statement", label: "Recorded loss statement", status: "extracted", receivedAt: ts(205) },
    { id: "DOC-4", type: "police_report", label: "Police report (driver report only)", status: "received", receivedAt: ts(190), pageCount: 1 },
  ],
  photos: [
    { id: "P1", label: "Front-end crush", damageZone: "Front bumper + radiator", severity: "severe" },
    { id: "P2", label: "Hood damage", damageZone: "Hood", severity: "severe" },
    { id: "P3", label: "Airbag deployment", damageZone: "Cabin", severity: "severe" },
  ],
  coverageSummary: {
    appliesTo: ["COLL"],
    ambiguities: [
      "Total loss claim on policy bound 28 days prior to loss.",
      "Loss severity inconsistent with claimant statement of low-speed contact.",
    ],
    reserveEstimate: 19800,
  },
  routing: {
    decision: "compliance_escalation",
    assigneeId: "ADJ-1140",
    assigneeName: "Priya Iyer",
    assigneeTier: "siu",
    confidence: 0.34,
    threshold: 0.85,
    rationale: [
      "Three SIU indicators triggered. Recommendation: SIU desk review before any reserve posting.",
      "Photometric analysis on hood/bumper damage inconsistent with claimant low-speed narrative.",
      "Policy age (28 days) and total-loss profile match historical SIU referral pattern.",
      "No third-party witnesses. Driver-only police report filed 14 hours after stated loss.",
    ],
  },
  siuFlags: [
    "Policy bound <30 days before loss (FL)",
    "Single-vehicle late-night loss, no witnesses",
    "Photometric vs. narrative inconsistency (severity)",
    "Delayed police report (driver-only, 14h)",
  ],
  activity: [
    { id: "A1", ts: ts(216), actor: "FNOL Intake", actorKind: "system", action: "FNOL received", detail: "Online portal" },
    { id: "A2", ts: ts(214), actor: "Routine: FNOL Intake v3.2", actorKind: "routine", action: "Policy bound", detail: "Policy NBM-AP-44012-25 — bound 28d prior", decision: "automated" },
    { id: "A3", ts: ts(210), actor: "Routine: Doc Extraction v2.4", actorKind: "routine", action: "Photos extracted", detail: "12 images, severity assessment complete", decision: "automated" },
    { id: "A4", ts: ts(206), actor: "Routine: SIU Screen v1.2", actorKind: "routine", action: "SIU indicators triggered", detail: "4 indicators above threshold. Halt auto-routing.", decision: "escalated" },
    { id: "A5", ts: ts(204), actor: "Routine: Routing v3.0", actorKind: "routine", action: "Routing → SIU desk", detail: "Confidence 0.34. Priya Iyer notified.", decision: "escalated" },
  ],
};

const CLAIM_COMPLEX: Claim = {
  id: "CLM-2026-0451756",
  state: "complex_loss",
  receivedAt: ts(312),
  lossDate: "2026-05-16",
  reportedVia: "agent",
  fnolMinutes: 312,
  claimant: {
    name: "Theresa Walsh (Unit 1 of 4)",
    phone: "(415) 555-0144",
    email: "twalsh.ca@example.com",
    state: "CA",
    policyholder: true,
  },
  policy: {
    number: "NBM-AP-89001-21",
    product: "Auto PD",
    effectiveDate: "2025-06-01",
    expirationDate: "2026-06-01",
    inForce: true,
    coverages: [
      { code: "COLL", label: "Collision", limit: "ACV", deductible: "$500" },
      { code: "PD", label: "Property Damage Liability", limit: "$300,000" },
      { code: "UMPD", label: "Uninsured Motorist PD", limit: "$50,000" },
    ],
  },
  loss: {
    type: "multi_vehicle",
    description: "Four-vehicle chain reaction on I-80 EB at the Bay Bridge approach. Two carriers identified on other units. One uninsured.",
    locationCity: "San Francisco",
    locationState: "CA",
    estimatedDamage: 22400,
    drivable: false,
    injuries: true,
    otherVehicles: 3,
  },
  documents: [
    { id: "DOC-1", type: "policy_declaration", label: "Policy declarations", status: "extracted", receivedAt: ts(312), pageCount: 5 },
    { id: "DOC-2", type: "police_report", label: "CHP report #26-44120 (12 pages)", status: "extracted", receivedAt: ts(280), pageCount: 12 },
    { id: "DOC-3", type: "photos", label: "Damage photos (18 across units)", status: "extracted", receivedAt: ts(285) },
    { id: "DOC-4", type: "loss_statement", label: "Recorded loss statement", status: "extracted", receivedAt: ts(270) },
    { id: "DOC-5", type: "tow_invoice", label: "Tow invoice", status: "extracted", receivedAt: ts(260) },
  ],
  photos: [
    { id: "P1", label: "Front bumper, hood", damageZone: "Front", severity: "severe" },
    { id: "P2", label: "Rear bumper, trunk", damageZone: "Rear", severity: "severe" },
    { id: "P3", label: "Unit 2 contact zone", damageZone: "Front of Unit 2", severity: "severe" },
    { id: "P4", label: "Wide chain-reaction shot", damageZone: "Scene", severity: "severe" },
  ],
  policeReport: {
    reportNumber: "CHP-26-44120",
    department: "California Highway Patrol",
    atFault: "unclear",
    citationIssued: false,
    narrativeSummary:
      "Four-vehicle chain-reaction on I-80 EB approaching Bay Bridge toll plaza. Liability allocated across multiple parties pending CHP supplemental. Unit 4 confirmed uninsured.",
    confidence: 0.88,
  },
  coverageSummary: {
    appliesTo: ["COLL", "PD", "UMPD"],
    ambiguities: [
      "Multi-party liability allocation pending CHP supplemental report.",
      "UMPD applies to Unit 4 contact only — split-damage attribution required.",
      "Subrogation potential on Units 2 and 3 carriers (Geico, State Farm identified).",
    ],
    reserveEstimate: 24800,
  },
  routing: {
    decision: "manual_reconciliation",
    assigneeId: "ADJ-1118",
    assigneeName: "Jamal Forrester",
    assigneeTier: "senior",
    confidence: 0.62,
    threshold: 0.85,
    rationale: [
      "Multi-party loss requires liability allocation that exceeds Routine scope.",
      "Subrogation paths identified on two other-party carriers — manual setup required.",
      "Injury indicator present (BI handled in separate claim, coordinate handoff).",
      "All intake assembly complete; routing reflects complexity not data quality.",
    ],
  },
  activity: [
    { id: "A1", ts: ts(312), actor: "FNOL Intake", actorKind: "system", action: "FNOL received", detail: "Agent submission · agent 1108" },
    { id: "A2", ts: ts(310), actor: "Routine: FNOL Intake v3.2", actorKind: "routine", action: "Policy bound", detail: "Policy in force", decision: "automated" },
    { id: "A3", ts: ts(295), actor: "Routine: Doc Extraction v2.4", actorKind: "routine", action: "CHP report parsed", detail: "12 pages · 4 units · 1 uninsured party identified", decision: "automated" },
    { id: "A4", ts: ts(280), actor: "Routine: Coverage Map v2.1", actorKind: "routine", action: "Multi-coverage applied", detail: "COLL + PD + UMPD", decision: "automated" },
    { id: "A5", ts: ts(275), actor: "Routine: Routing v3.0", actorKind: "routine", action: "Routing → manual reconciliation", detail: "Senior assignment recommended: Jamal Forrester", decision: "escalated" },
  ],
};

export const CLAIMS: Claim[] = [
  CLAIM_READY,
  CLAIM_MISSING_DOC,
  CLAIM_COVERAGE,
  CLAIM_SIU,
  CLAIM_COMPLEX,
];

// Additional queue padding — shown as rows without full detail.
export const QUEUE_PADDING: Array<{
  id: string;
  state: Claim["state"];
  claimant: string;
  lossType: string;
  reserve: number;
  fnolMin: number;
  confidence: number;
  routing: string;
}> = [
  { id: "CLM-2026-0451828", state: "ready_to_assign", claimant: "K. Patel", lossType: "Rear-end", reserve: 4200, fnolMin: 14, confidence: 0.92, routing: "Fast Track A" },
  { id: "CLM-2026-0451827", state: "ready_to_assign", claimant: "B. Johnson", lossType: "Parking lot", reserve: 1850, fnolMin: 19, confidence: 0.96, routing: "Fast Track A" },
  { id: "CLM-2026-0451826", state: "ready_to_assign", claimant: "T. Nakamura", lossType: "Rear-end", reserve: 5300, fnolMin: 22, confidence: 0.89, routing: "Fast Track B" },
  { id: "CLM-2026-0451825", state: "missing_documents", claimant: "F. Andersen", lossType: "Single-vehicle", reserve: 0, fnolMin: 38, confidence: 0.51, routing: "Intake recovery" },
  { id: "CLM-2026-0451824", state: "ready_to_assign", claimant: "G. Mehrotra", lossType: "Intersection", reserve: 6900, fnolMin: 24, confidence: 0.87, routing: "Fast Track A" },
  { id: "CLM-2026-0451823", state: "ready_to_assign", claimant: "P. Quinn", lossType: "Rear-end", reserve: 3100, fnolMin: 28, confidence: 0.93, routing: "Fast Track A" },
  { id: "CLM-2026-0451822", state: "coverage_review", claimant: "L. Akpan", lossType: "Multi-vehicle", reserve: 9800, fnolMin: 96, confidence: 0.74, routing: "Senior review" },
  { id: "CLM-2026-0451821", state: "ready_to_assign", claimant: "M. Tran", lossType: "Parking lot", reserve: 2100, fnolMin: 33, confidence: 0.95, routing: "Fast Track B" },
  { id: "CLM-2026-0451820", state: "missing_documents", claimant: "R. Owens", lossType: "Rear-end", reserve: 0, fnolMin: 47, confidence: 0.48, routing: "Intake recovery" },
  { id: "CLM-2026-0451819", state: "ready_to_assign", claimant: "S. Cabrera", lossType: "Rear-end", reserve: 4700, fnolMin: 36, confidence: 0.91, routing: "Fast Track A" },
  { id: "CLM-2026-0451818", state: "siu_escalation", claimant: "J. Becker", lossType: "Single-vehicle", reserve: 14200, fnolMin: 108, confidence: 0.39, routing: "SIU desk" },
  { id: "CLM-2026-0451817", state: "ready_to_assign", claimant: "W. Chu", lossType: "Intersection", reserve: 7200, fnolMin: 41, confidence: 0.88, routing: "Fast Track B" },
  { id: "CLM-2026-0451816", state: "complex_loss", claimant: "D. Vasquez", lossType: "Multi-vehicle", reserve: 17600, fnolMin: 198, confidence: 0.66, routing: "Senior review" },
  { id: "CLM-2026-0451815", state: "ready_to_assign", claimant: "H. Sato", lossType: "Rear-end", reserve: 3600, fnolMin: 44, confidence: 0.94, routing: "Fast Track A" },
];

export const QUEUE_BUCKETS: QueueBucket[] = [
  { label: "Ready to assign", state: "ready_to_assign", count: 187, agingP50Min: 18, agingP90Min: 41, slaRisk: 0.04 },
  { label: "Intake recovery", state: "missing_documents", count: 64, agingP50Min: 52, agingP90Min: 142, slaRisk: 0.31 },
  { label: "Coverage review", state: "coverage_review", count: 22, agingP50Min: 88, agingP90Min: 230, slaRisk: 0.18 },
  { label: "SIU escalation", state: "siu_escalation", count: 9, agingP50Min: 174, agingP90Min: 412, slaRisk: 0.22 },
  { label: "Complex loss", state: "complex_loss", count: 14, agingP50Min: 198, agingP90Min: 488, slaRisk: 0.36 },
];

export const OPS_METRICS: MetricSnapshot[] = [
  {
    label: "FNOL → assignment (median, last 24h)",
    value: "14m",
    delta: "−2h 47m",
    trend: "down",
    intent: "good",
    sub: "Baseline (wk0): 3h 01m",
  },
  {
    label: "Adjuster-minutes reclaimed / claim",
    value: "37m",
    delta: "+11m vs. wk2",
    trend: "up",
    intent: "good",
    sub: "Manual assembly eliminated",
  },
  {
    label: "Auto-assignment rate (Fast Track)",
    value: "72.4%",
    delta: "+4.1 pts vs. wk2",
    trend: "up",
    intent: "good",
    sub: "Threshold: ≥ 0.85 confidence",
  },
  {
    label: "Override rate",
    value: "6.8%",
    delta: "+0.4 pts",
    trend: "up",
    intent: "neutral",
    sub: "Inside SLA band (5–10%)",
  },
  {
    label: "Reroute rate",
    value: "3.1%",
    delta: "−1.9 pts vs. wk2",
    trend: "down",
    intent: "good",
    sub: "Mis-tier assignments → senior",
  },
  {
    label: "Auto PD backlog",
    value: "296",
    delta: "−118 vs. wk2",
    trend: "down",
    intent: "good",
    sub: "Inflow 1,640/day · clear 1,712/day",
  },
];

export const EXCEPTIONS: Exception[] = [
  { id: "EXC-1", claimId: "CLM-2026-0451814", category: "missing_doc", detail: "Police report missing (IL hit-and-run statute)", openedAt: ts(40), owner: "Intake Recovery", ageMin: 40 },
  { id: "EXC-2", claimId: "CLM-2026-0451820", category: "missing_doc", detail: "Loss statement not captured — IVR drop", openedAt: ts(44), owner: "Intake Recovery", ageMin: 44 },
  { id: "EXC-3", claimId: "CLM-2026-0451802", category: "coverage_ambiguity", detail: "Permissive-use under TX endorsement", openedAt: ts(108), owner: "S. Kowalski", ageMin: 108 },
  { id: "EXC-4", claimId: "CLM-2026-0451822", category: "coverage_ambiguity", detail: "Multi-vehicle allocation pending CHP supplemental", openedAt: ts(94), owner: "J. Forrester", ageMin: 94 },
  { id: "EXC-5", claimId: "CLM-2026-0451780", category: "siu_indicator", detail: "4 SIU indicators — photometric vs. narrative", openedAt: ts(206), owner: "P. Iyer", ageMin: 206 },
  { id: "EXC-6", claimId: "CLM-2026-0451818", category: "siu_indicator", detail: "Policy age 31d · single-vehicle total loss", openedAt: ts(106), owner: "P. Iyer", ageMin: 106 },
  { id: "EXC-7", claimId: "CLM-2026-0451756", category: "complex_loss", detail: "4-unit chain-reaction · subrogation across 2 carriers", openedAt: ts(275), owner: "J. Forrester", ageMin: 275 },
  { id: "EXC-8", claimId: "CLM-2026-0451816", category: "complex_loss", detail: "Multi-vehicle, injury claim handoff to BI desk", openedAt: ts(196), owner: "S. Kowalski", ageMin: 196 },
  { id: "EXC-9", claimId: "CLM-2026-0451825", category: "missing_doc", detail: "Photo set incomplete — single-vehicle", openedAt: ts(36), owner: "Intake Recovery", ageMin: 36 },
];

export const OVERRIDE_LOG: OverrideEvent[] = [
  {
    id: "OVR-2026-00118",
    ts: ts(34),
    claimId: "CLM-2026-0451826",
    actor: "Marcus Tilden (ADJ-1052)",
    fromRouting: "Fast Track A → Renee Whitford",
    toRouting: "Fast Track A → Marcus Tilden",
    reason: "Load balancing — Whitford at 38/55 capacity; adjuster self-claimed.",
    confidence: 0.89,
    category: "intake",
  },
  {
    id: "OVR-2026-00117",
    ts: ts(67),
    claimId: "CLM-2026-0451822",
    actor: "Sarah Kowalski (ADJ-1112)",
    fromRouting: "Senior Review → Sarah Kowalski",
    toRouting: "Senior Review → Jamal Forrester",
    reason: "Conflict — adjuster handled prior claim on same insured 2025-11.",
    confidence: 0.78,
    category: "coverage",
  },
  {
    id: "OVR-2026-00116",
    ts: ts(118),
    claimId: "CLM-2026-0451812",
    actor: "Renee Whitford (ADJ-1041)",
    fromRouting: "Fast Track A",
    toRouting: "Senior Review",
    reason: "Damage assessment flagged moderate but bumper teardown estimate $14.8k. Above Fast Track band.",
    confidence: 0.86,
    category: "intake",
  },
  {
    id: "OVR-2026-00115",
    ts: ts(155),
    claimId: "CLM-2026-0451811",
    actor: "Priya Iyer (ADJ-1140)",
    fromRouting: "SIU Desk",
    toRouting: "Fast Track A",
    reason: "SIU screen overruled — claimant produced corroborating witness statement and timestamped video.",
    confidence: 0.41,
    category: "siu",
  },
  {
    id: "OVR-2026-00114",
    ts: ts(212),
    claimId: "CLM-2026-0451809",
    actor: "Jamal Forrester (ADJ-1118)",
    fromRouting: "Senior Review",
    toRouting: "Fast Track B",
    reason: "Coverage ambiguity resolved — endorsement on file confirms named-driver scope.",
    confidence: 0.73,
    category: "coverage",
  },
  {
    id: "OVR-2026-00113",
    ts: ts(298),
    claimId: "CLM-2026-0451804",
    actor: "Linh Nguyen (ADJ-1078)",
    fromRouting: "Fast Track B → Linh Nguyen",
    toRouting: "Senior Review → Jamal Forrester",
    reason: "Third-party injury claim opened against insured during intake — escalated per protocol.",
    confidence: 0.84,
    category: "complex",
  },
];

export const INTEGRATIONS: IntegrationNode[] = [
  { id: "guidewire-cc", label: "Guidewire ClaimCenter", kind: "system_of_record", status: "healthy", lastSync: ts(0), notes: "Bi-directional · claim create, assignment, status, notes" },
  { id: "guidewire-pc", label: "Guidewire PolicyCenter", kind: "system_of_record", status: "healthy", lastSync: ts(1), notes: "Read-only · policy binding, coverage, in-force status" },
  { id: "guidewire-bc", label: "Guidewire BillingCenter", kind: "data_source", status: "healthy", lastSync: ts(2), notes: "Renewal payment confirmation lookup" },
  { id: "channel-portal", label: "Claimant web portal", kind: "channel", status: "healthy", lastSync: ts(0) },
  { id: "channel-ivr", label: "Phone IVR (Genesys)", kind: "channel", status: "healthy", lastSync: ts(0) },
  { id: "channel-agent", label: "Agent submission portal", kind: "channel", status: "healthy", lastSync: ts(0) },
  { id: "doc-extract", label: "Routine: Doc Extraction v2.4", kind: "routine", status: "healthy", lastSync: ts(0), notes: "Police reports, photos, declarations" },
  { id: "fnol-intake", label: "Routine: FNOL Intake v3.2", kind: "routine", status: "healthy", lastSync: ts(0), notes: "Policy bind, coverage map" },
  { id: "routing", label: "Routine: Routing v3.0", kind: "routine", status: "healthy", lastSync: ts(0), notes: "Confidence ≥ 0.85 auto-assigns" },
  { id: "siu-screen", label: "Routine: SIU Screen v1.2", kind: "routine", status: "healthy", lastSync: ts(0), notes: "Indicator engine · 14 active rules" },
  { id: "intake-recovery", label: "Routine: Intake Recovery v1.1", kind: "routine", status: "degraded", lastSync: ts(8), notes: "SMS provider latency elevated (p95 4.1s)" },
  { id: "downstream-bi", label: "BI Desk handoff", kind: "downstream", status: "healthy", lastSync: ts(0) },
  { id: "downstream-subro", label: "Subrogation queue", kind: "downstream", status: "healthy", lastSync: ts(0) },
];

export function getAdjusterById(id?: string): Adjuster | undefined {
  if (!id) return undefined;
  return adjusterById[id];
}

export function getClaimById(id: string): Claim | undefined {
  return CLAIMS.find(c => c.id === id);
}
