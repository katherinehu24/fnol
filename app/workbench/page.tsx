"use client";

import { ClaimQueue } from "@/components/workbench/ClaimQueue";
import { ClaimDetail } from "@/components/workbench/ClaimDetail";
import { RoutingPanel } from "@/components/workbench/RoutingPanel";
import { useWorkbench } from "@/lib/store";

export default function WorkbenchPage() {
  const { claims, selectedClaimId } = useWorkbench();
  const claim = claims.find((c) => c.id === selectedClaimId) ?? claims[0];

  return (
    <div
      className="grid h-[calc(100vh-76px)] min-h-0"
      style={{ gridTemplateColumns: "320px minmax(0, 1fr) 380px" }}
    >
      <ClaimQueue />
      <ClaimDetail claim={claim} />
      <RoutingPanel claim={claim} />
    </div>
  );
}
