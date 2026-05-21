"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DEMO_STEPS, useWorkbench } from "@/lib/store";

export function DemoBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { active, step } = useWorkbench((s) => s.demoMode);
  const next = useWorkbench((s) => s.nextDemoStep);
  const prev = useWorkbench((s) => s.prevDemoStep);
  const exit = useWorkbench((s) => s.exitDemo);
  const select = useWorkbench((s) => s.select);

  const current = DEMO_STEPS.find((s) => s.step === step) ?? DEMO_STEPS[0];

  useEffect(() => {
    if (!active) return;
    // Drive route + selection from the step
    if (current.goto && pathname !== current.goto) {
      router.push(current.goto);
    }
    if (current.claimId) {
      select(current.claimId);
    }
  }, [active, current.step]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) return null;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[min(960px,calc(100vw-32px))]">
      <div className="panel bg-ink-800/95 border-accent/40 shadow-xl backdrop-blur">
        <div className="px-3 py-2.5 flex items-center gap-3">
          <div className="shrink-0 flex items-center gap-2 pr-3 border-r border-ink-700">
            <span className="text-2xs uppercase tracking-[0.18em] text-accent font-medium">Demo</span>
            <span className="font-mono text-[11.5px] text-ink-200">
              {String(step).padStart(2, "0")} / {String(DEMO_STEPS.length).padStart(2, "0")}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-ink-50 font-medium truncate">{current.title}</div>
            <div className="text-2xs text-ink-300 mt-0.5 line-clamp-1">{current.body}</div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={prev}
              disabled={step === 1}
              className="btn btn-ghost h-8 px-2"
              aria-label="Previous step"
            >
              ‹
            </button>
            <button
              onClick={next}
              disabled={step === DEMO_STEPS.length}
              className="btn btn-primary h-8 px-3"
            >
              Next ›
            </button>
            <button onClick={exit} className="btn btn-ghost h-8 px-2" title="Exit demo mode">
              ✕
            </button>
          </div>
        </div>
        <div className="px-3 pb-2 flex items-center gap-1">
          {DEMO_STEPS.map((s) => (
            <span
              key={s.step}
              className={`h-1 flex-1 rounded-sm ${s.step <= step ? "bg-accent" : "bg-ink-700"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
