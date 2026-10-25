import React from "react";

interface DecisionStampProps {
  decision: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function DecisionStamp({ decision, size = "md", className = "" }: DecisionStampProps) {
  const d = (decision || "").toUpperCase();
  
  const sizeClasses = {
    sm: "text-[11px] px-2.5 py-0.5 font-semibold",
    md: "text-xs px-3.5 py-1 font-semibold",
    lg: "text-sm px-4 py-1.5 font-bold",
  }[size];

  if (d === "ALLOW" || d === "ALLOWED" || d === "COMPLIANT") {
    return (
      <span
        className={`inline-flex items-center justify-center -rotate-2 rounded-full border-1.5 border-ink bg-allow text-white shadow-ink-sm select-none ${sizeClasses} ${className}`}
        style={{ borderWidth: "1.5px" }}
      >
        Allow
      </span>
    );
  }

  if (d === "HOLD_FOR_APPROVAL" || d === "HOLD" || d === "HELD" || d === "REQUIRES_APPROVAL") {
    return (
      <span
        className={`inline-flex items-center justify-center rotate-1 rounded-full border-1.5 border-ink bg-hold text-ink shadow-ink-sm select-none font-bold ${sizeClasses} ${className}`}
        style={{ borderWidth: "1.5px" }}
      >
        Hold for review
      </span>
    );
  }

  if (d === "BLOCK" || d === "BLOCKED" || d === "PROHIBITED") {
    return (
      <span
        className={`inline-flex items-center justify-center -rotate-2 rounded-full border-1.5 border-ink bg-fuchsia text-white shadow-ink-sm select-none ${sizeClasses} ${className}`}
        style={{ borderWidth: "1.5px" }}
      >
        Block
      </span>
    );
  }

  if (d === "ISOLATE" || d === "ISOLATED" || d === "CRITICAL") {
    return (
      <span
        className={`inline-flex items-center justify-center rotate-2 rounded-full border-1.5 border-ink bg-pinkPrimary text-white shadow-pink select-none ${sizeClasses} ${className}`}
        style={{ borderWidth: "1.5px" }}
      >
        Isolate
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border-1.5 border-ink/40 bg-white text-ink shadow-sm select-none ${sizeClasses} ${className}`}
      style={{ borderWidth: "1.5px" }}
    >
      {decision}
    </span>
  );
}

export function SignalBar({ label, value, max = 1.0 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const getFill = (val: number) => {
    if (val >= 0.7) return "bg-pinkPrimary";
    if (val >= 0.3) return "bg-hold";
    return "bg-allow";
  };

  return (
    <div className="flex items-center space-x-1.5 text-xs font-mono">
      <span className="w-3 text-ink font-bold">{label}</span>
      <div className="w-14 h-2 bg-canvas border border-ink/40 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${getFill(value)}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-inkMuted w-7 text-right">{value.toFixed(2)}</span>
    </div>
  );
}
