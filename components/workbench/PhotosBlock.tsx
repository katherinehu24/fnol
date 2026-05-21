"use client";

import { Panel, Pill } from "@/components/ui/primitives";
import type { Claim } from "@/lib/types";

const SEVERITY_TONE: Record<string, "good" | "warn" | "crit"> = {
  minor: "good",
  moderate: "warn",
  severe: "crit",
};

// Each photo is rendered as a stylized SVG placeholder with damage zone labeling.
// We deliberately avoid loading real images — placeholders communicate "extracted, zone identified."
function PhotoTile({ label, zone, severity }: { label: string; zone: string; severity: string }) {
  return (
    <div className="panel p-0 overflow-hidden">
      <div className="relative aspect-[4/3] bg-ink-800 border-b border-ink-700">
        <svg viewBox="0 0 200 150" className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1b2230" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="200" height="150" fill="url(#grid)" />
          {/* Stylized vehicle silhouette */}
          <g opacity="0.85">
            <rect x="40" y="55" width="120" height="40" rx="6" fill="#222a37" stroke="#3a4555" />
            <rect x="55" y="40" width="90" height="22" rx="4" fill="#222a37" stroke="#3a4555" />
            <circle cx="60" cy="100" r="8" fill="#0e131a" stroke="#3a4555" />
            <circle cx="140" cy="100" r="8" fill="#0e131a" stroke="#3a4555" />
          </g>
          {/* Damage zone highlight */}
          <g>
            <rect
              x={zone.toLowerCase().includes("front") ? 35 : zone.toLowerCase().includes("rear") ? 145 : 80}
              y={zone.toLowerCase().includes("hood") || zone.toLowerCase().includes("trunk") ? 38 : 60}
              width="22"
              height="30"
              fill={severity === "severe" ? "rgba(217, 74, 74, 0.35)" : severity === "moderate" ? "rgba(217, 154, 43, 0.35)" : "rgba(47, 154, 114, 0.35)"}
              stroke={severity === "severe" ? "#d94a4a" : severity === "moderate" ? "#d99a2b" : "#2f9a72"}
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          </g>
        </svg>
        <div className="absolute top-1 right-1">
          <Pill tone={SEVERITY_TONE[severity] ?? "neutral"}>{severity}</Pill>
        </div>
      </div>
      <div className="px-2 py-1.5">
        <div className="text-[11.5px] text-ink-100 truncate">{label}</div>
        <div className="text-2xs text-ink-400 truncate">Zone: {zone}</div>
      </div>
    </div>
  );
}

export function PhotosBlock({ claim }: { claim: Claim }) {
  if (claim.photos.length === 0) return null;
  return (
    <Panel
      title="Damage photos · extracted"
      subtitle={`${claim.photos.length} images · zones identified by Routine`}
      actions={
        <Pill tone="info">
          Auto-tagged
        </Pill>
      }
    >
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {claim.photos.map((p) => (
          <PhotoTile key={p.id} label={p.label} zone={p.damageZone} severity={p.severity} />
        ))}
      </div>
    </Panel>
  );
}
