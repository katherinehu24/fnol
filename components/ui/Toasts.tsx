"use client";

import { useWorkbench } from "@/lib/store";
import { IconDot } from "./primitives";

const KIND_STYLES = {
  good: "border-ok/40 bg-ok-900/60",
  info: "border-accent/40 bg-accent/15",
  warn: "border-amber/40 bg-amber-900/60",
  crit: "border-crit/40 bg-crit-900/60",
} as const;

const KIND_DOT = {
  good: "good",
  info: "info",
  warn: "warn",
  crit: "crit",
} as const;

export function ToastHost() {
  const toasts = useWorkbench((s) => s.toasts);
  const dismiss = useWorkbench((s) => s.dismissToast);
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-[380px]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`panel border ${KIND_STYLES[t.kind]} px-3 py-2 shadow-lg pointer-events-auto`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 min-w-0">
              <span className="mt-1.5">
                <IconDot tone={KIND_DOT[t.kind]} />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] text-ink-50 font-medium">{t.title}</div>
                {t.body && <div className="text-2xs text-ink-200 mt-0.5">{t.body}</div>}
              </div>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-2xs text-ink-400 hover:text-ink-100 uppercase tracking-wider"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
