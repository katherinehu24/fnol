import { ReactNode } from "react";

interface PanelProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Panel({ title, subtitle, actions, children, className = "", bodyClassName = "" }: PanelProps) {
  return (
    <section className={`panel ${className}`}>
      {(title || actions) && (
        <header className="panel-head">
          <div className="flex items-baseline gap-3">
            {title && <h3 className="panel-title">{title}</h3>}
            {subtitle && <span className="text-2xs text-ink-400">{subtitle}</span>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName || "p-3"}>{children}</div>
    </section>
  );
}

type Tone = "neutral" | "info" | "good" | "warn" | "crit" | "siu" | "routine" | "human";

const toneClasses: Record<Tone, string> = {
  neutral: "border-ink-600 text-ink-200 bg-ink-800",
  info: "border-accent/40 text-accent bg-accent/10",
  good: "border-ok/40 text-ok bg-ok-900/40",
  warn: "border-amber/40 text-amber bg-amber-900/40",
  crit: "border-crit/40 text-crit bg-crit-900/40",
  siu: "border-crit/40 text-crit bg-crit-900/40",
  routine: "border-accent/40 text-accent bg-accent/10",
  human: "border-ink-500 text-ink-100 bg-ink-700",
};

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`pill ${toneClasses[tone]}`}>{children}</span>;
}

export function DataRow({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="data-row">
      <span className="data-label">{label}</span>
      <span className={`data-value text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export function Stat({
  label,
  value,
  delta,
  intent = "neutral",
  sub,
}: {
  label: string;
  value: string;
  delta?: string;
  intent?: "good" | "warn" | "bad" | "neutral";
  sub?: string;
}) {
  const deltaColor =
    intent === "good"
      ? "text-ok"
      : intent === "warn"
      ? "text-amber"
      : intent === "bad"
      ? "text-crit"
      : "text-ink-300";
  return (
    <div className="panel p-3 flex flex-col gap-1">
      <div className="data-label">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-[26px] font-medium text-ink-50 tracking-tight leading-none">{value}</div>
        {delta && <div className={`text-[12px] ${deltaColor}`}>{delta}</div>}
      </div>
      {sub && <div className="text-2xs text-ink-400">{sub}</div>}
    </div>
  );
}

export function ConfidenceBar({ value, threshold }: { value: number; threshold: number }) {
  const pct = Math.round(value * 100);
  const tpct = Math.round(threshold * 100);
  const passing = value >= threshold;
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-1">
        <span className="data-label">Routing confidence</span>
        <span className={`font-mono text-[12px] ${passing ? "text-ok" : "text-amber"}`}>
          {pct}% {passing ? "≥" : "<"} {tpct}%
        </span>
      </div>
      <div className="relative h-1.5 bg-ink-700 rounded-sm overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${passing ? "bg-ok" : "bg-amber"}`}
          style={{ width: `${pct}%` }}
        />
        <div className="absolute inset-y-0 w-px bg-ink-50/70" style={{ left: `${tpct}%` }} title={`Threshold ${tpct}%`} />
      </div>
      <div className="flex justify-between mt-1 text-2xs text-ink-400">
        <span>0%</span>
        <span>Threshold {tpct}%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="text-[15px] font-medium text-ink-50">{title}</h2>
      {sub && <span className="text-2xs text-ink-300">{sub}</span>}
    </div>
  );
}

export function IconDot({ tone }: { tone: "good" | "warn" | "crit" | "neutral" | "info" }) {
  const color =
    tone === "good" ? "bg-ok" : tone === "warn" ? "bg-amber" : tone === "crit" ? "bg-crit" : tone === "info" ? "bg-accent" : "bg-ink-400";
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />;
}
