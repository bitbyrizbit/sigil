export function formatIST(timestampStr?: string | null): string {
  if (!timestampStr) return "--:--:--";
  try {
    // If string lacks timezone offset (e.g. "2026-10-25T10:08:06"), append Z to indicate UTC storage
    const raw = timestampStr.endsWith("Z") || timestampStr.includes("+") ? timestampStr : `${timestampStr}Z`;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return timestampStr;
    return (
      d.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }) + " IST"
    );
  } catch {
    return timestampStr || "--:--:--";
  }
}
