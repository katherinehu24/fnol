import { redirect } from "next/navigation";

export default function GovernanceLegacyRedirect() {
  // Governance content was consolidated into Architecture (thresholds, posture)
  // and Operations (override log, audit-by-claim). This route remains for any
  // bookmarked deep links from the v1/v2 deployments.
  redirect("/architecture");
}
