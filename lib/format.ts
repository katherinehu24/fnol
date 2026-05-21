export function formatRelative(iso: string, nowIso?: string): string {
  const now = nowIso ? new Date(nowIso) : new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  const rem = min % 60;
  if (hr < 24) return rem ? `${hr}h ${rem}m ago` : `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export function formatAge(min: number): string {
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  const rem = min % 60;
  if (hr < 24) return rem ? `${hr}h ${rem}m` : `${hr}h`;
  const d = Math.floor(hr / 24);
  const hrem = hr % 24;
  return hrem ? `${d}d ${hrem}h` : `${d}d`;
}

export function formatMoney(n: number): string {
  if (n === 0) return "—";
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
  );
}
