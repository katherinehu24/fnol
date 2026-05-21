"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { useWorkbench } from "@/lib/store";
import { ToastHost } from "./ui/Toasts";
import { DemoBar } from "./ui/DemoBar";

const TABS: Array<{ href: string; label: string; hint: string }> = [
  { href: "/workbench", label: "Adjuster Workbench", hint: "Auto PD · Intake" },
  { href: "/operations", label: "Operations", hint: "Maria Chen view" },
  { href: "/governance", label: "Governance", hint: "Compliance · Audit" },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const demoActive = useWorkbench((s) => s.demoMode.active);
  const startDemo = useWorkbench((s) => s.startDemo);
  const exitDemo = useWorkbench((s) => s.exitDemo);

  return (
    <div className="min-h-screen flex flex-col bg-ink-900 text-ink-100">
      <header className="bg-ink-950 border-b border-ink-700">
        <div className="px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 grid place-items-center bg-ink-700 border border-ink-600 rounded-sm">
                <span className="font-mono text-[11px] text-accent">NB</span>
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-medium text-ink-50">NorthBay Mutual · ClaimCenter</div>
                <div className="text-2xs text-ink-400 tracking-wide">
                  Auto PD · FNOL Intake · Production · Wk 4 of 12
                </div>
              </div>
            </div>
            <nav className="flex items-center gap-1 ml-4">
              {TABS.map((t) => {
                const active = pathname?.startsWith(t.href);
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={`px-3 h-9 flex items-center gap-2 border-b-2 transition-colors ${
                      active
                        ? "border-accent text-ink-50"
                        : "border-transparent text-ink-300 hover:text-ink-100"
                    }`}
                  >
                    <span className="text-[13px]">{t.label}</span>
                    <span className="text-2xs text-ink-400 hidden xl:inline">· {t.hint}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-2xs text-ink-300">
            <button
              onClick={demoActive ? exitDemo : startDemo}
              className={`btn h-7 px-2.5 ${demoActive ? "btn-primary" : "btn-ghost"}`}
              title="Toggle guided demo sequence"
            >
              {demoActive ? "Exit demo" : "Demo mode"}
            </button>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              <span>Routines healthy · 11 of 11</span>
            </div>
            <span className="text-ink-500">|</span>
            <span className="font-mono">env: prod-us-east-1</span>
            <span className="text-ink-500">|</span>
            <span>K. Hu · Supervisor</span>
          </div>
        </div>
        <div className="px-4 h-7 flex items-center gap-4 text-2xs text-ink-400 bg-ink-900 border-t border-ink-700">
          <span>Deployment: <span className="text-ink-100">FNOL Intake v3.2</span></span>
          <span>·</span>
          <span>Threshold profile: <span className="text-ink-100">Fast Track ≥ 0.85</span></span>
          <span>·</span>
          <span>SIU profile: <span className="text-ink-100">14 active rules</span></span>
          <span>·</span>
          <span>Last routine sync: <span className="font-mono text-ink-100">14:32:04 ET</span></span>
          <span className="ml-auto flex items-center gap-1.5 text-amber/80">
            <span className="h-1.5 w-1.5 rounded-full bg-amber" />
            <span className="uppercase tracking-wider">Simulated data · frontend prototype</span>
          </span>
        </div>
      </header>
      <main className="flex-1 min-h-0">{children}</main>
      <ToastHost />
      <DemoBar />
    </div>
  );
}
