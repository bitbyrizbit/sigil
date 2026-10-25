"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle, Check, Sparkles } from "lucide-react";
import { DecisionStamp, SignalBar } from "./Stamp";

interface DriftAlertsProps {
  alerts: any[];
  onResolveAlert: (alertId: string, status: string) => void;
}

export default function DriftAlerts({ alerts, onResolveAlert }: DriftAlertsProps) {
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const filtered = alerts.filter((a) => {
    const matchesSev = filterSeverity === "ALL" || a.severity === filterSeverity;
    const matchesStat = filterStatus === "ALL" || a.status === filterStatus;
    return matchesSev && matchesStat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink/15 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-pinkPrimary stroke-[2]" />
            Evidence-backed drift alerts
          </h2>
          <p className="text-xs text-inkMuted font-sans mt-0.5">
            Every incident provides full contextual explanations and supporting telemetry—no opaque anomaly scores
          </p>
        </div>
        <div className="text-xs font-sans text-ink">
          Open incidents: <strong className="font-num font-bold tabular-nums text-pinkPrimary">{alerts.filter(a => a.status === "OPEN").length}</strong>
        </div>
      </div>

      {/* Filter Chips: Rounded-full pills */}
      <div className="p-4 bg-paper border-1.5 border-ink/80 rounded-3xl shadow-ink-sm flex flex-wrap gap-3 items-center justify-between font-sans text-xs" style={{ borderWidth: "1.5px" }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-inkMuted mr-1">Severity:</span>
          {[
            { id: "ALL", label: "All" },
            { id: "CRITICAL", label: "Critical" },
            { id: "HIGH", label: "High" },
            { id: "MEDIUM", label: "Medium" },
            { id: "LOW", label: "Low" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterSeverity(item.id)}
              className={`px-3 py-1 rounded-full text-xs transition-all border ${
                filterSeverity === item.id
                  ? "bg-pinkPrimary text-white font-bold border-pinkPrimary shadow-pink"
                  : "bg-paper text-ink border-ink/20 hover:border-ink/50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-inkMuted mr-1">Status:</span>
          {[
            { id: "ALL", label: "All" },
            { id: "OPEN", label: "Open" },
            { id: "RESOLVED", label: "Resolved" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterStatus(item.id)}
              className={`px-3 py-1 rounded-full text-xs transition-all border ${
                filterStatus === item.id
                  ? "bg-ink text-white font-bold border-ink shadow-ink-sm"
                  : "bg-paper text-ink border-ink/20 hover:border-ink/50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-paper border-1.5 border-ink/40 rounded-3xl shadow-sm text-inkMuted text-xs font-sans">
            No alerts matching current filters.
          </div>
        ) : (
          filtered.map((alert) => {
            const isCritical = alert.severity === "CRITICAL";
            const isHigh = alert.severity === "HIGH";
            const isOpen = alert.status === "OPEN";

            return (
              <div
                key={alert.alert_id}
                className={`p-6 bg-paper border-1.5 border-ink/80 rounded-3xl shadow-ink transition-all ${
                  !isOpen ? "opacity-75" : ""
                }`}
                style={{ borderWidth: "1.5px" }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-ink/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-0.5 rounded-full border-1.5 border-ink font-sans text-[11px] font-bold shadow-ink-sm ${
                          isCritical
                            ? "bg-pinkPrimary text-white"
                            : isHigh
                            ? "bg-fuchsia text-white"
                            : "bg-hold text-ink"
                        }`}
                        style={{ borderWidth: "1.5px" }}
                      >
                        {alert.severity === "CRITICAL" ? "Critical risk" : alert.severity === "HIGH" ? "High risk" : alert.severity === "MEDIUM" ? "Medium risk" : "Low risk"}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full border border-ink/20 bg-canvas text-ink font-sans text-[11px]">
                        Policy: {alert.policy_status || "prohibited"}
                      </span>
                      <span className="text-xs font-num text-inkMuted">{alert.alert_id}</span>
                      <span className="text-xs font-num text-inkMuted tabular-nums">
                        {alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : ""}
                      </span>
                    </div>

                    <h3 className="text-base font-serif font-bold text-ink mt-1.5 flex items-center gap-2">
                      <span>{alert.agent_name}</span>
                      <span className="text-xs font-sans font-normal text-inkMuted">({alert.role})</span>
                    </h3>
                  </div>

                  {/* Stamp & Large Tactical Risk Score */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] font-sans text-inkMuted uppercase block font-semibold">Risk score</span>
                      <div className="text-2xl font-num font-bold text-fuchsia tabular-nums">
                        {alert.risk_score}
                        <span className="text-xs text-inkMuted font-normal"> / 100</span>
                      </div>
                    </div>
                    <div className="text-right pl-3 border-l border-ink/15">
                      <span className="text-[10px] font-sans text-inkMuted uppercase block font-semibold">Certainty</span>
                      <div className="text-2xl font-num font-bold text-ink tabular-nums">
                        {Math.round(alert.confidence * 100)}%
                      </div>
                    </div>
                    <div className="pl-2">
                      <DecisionStamp decision={alert.enforced_response} size="md" />
                    </div>
                  </div>
                </div>

                {/* Evidence Explanation Card */}
                <div className="mt-4 p-4 bg-canvas/40 border border-ink/15 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-pinkPrimary font-sans text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Evidence-backed causal explanation</span>
                  </div>
                  <p className="text-xs text-ink leading-relaxed font-sans">{alert.explanation}</p>
                </div>

                {/* Supporting Observed Signals */}
                {alert.evidence && alert.evidence.length > 0 && (
                  <div className="mt-4">
                    <span className="text-[11px] font-sans font-bold text-inkMuted block mb-1.5">
                      Observed telemetry corroboration:
                    </span>
                    <ul className="space-y-1 font-sans">
                      {alert.evidence.map((ev: string, idx: number) => (
                        <li key={idx} className="text-xs text-ink/80 flex items-start gap-2">
                          <span className="text-pinkPrimary font-bold">»</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Multi-Signal Breakdown (P, T, B, I, C) as Ledger Bars */}
                {alert.signals && (
                  <div className="mt-4 pt-3.5 border-t border-ink/10 flex flex-wrap items-center gap-4 font-sans">
                    <span className="text-[11px] text-inkMuted font-bold">Signal breakdown:</span>
                    <SignalBar label="P" value={alert.signals.P} />
                    <SignalBar label="T" value={alert.signals.T} />
                    <SignalBar label="B" value={alert.signals.B} />
                    <SignalBar label="I" value={alert.signals.I} />
                    <SignalBar label="C" value={alert.signals.C} />
                  </div>
                )}

                {/* Actions Footer */}
                <div className="mt-4 pt-3.5 border-t border-ink/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
                  <div className="text-inkMuted">
                    Target resource: <strong className="text-ink">{alert.target_resource || "External tool boundary"}</strong>
                  </div>

                  <div>
                    {isOpen ? (
                      <button
                        onClick={() => onResolveAlert(alert.alert_id, "RESOLVED")}
                        className="px-4 py-1.5 rounded-full bg-paper border-1.5 border-ink text-ink font-semibold hover:bg-allow hover:text-white hover:border-ink shadow-ink-sm transition-all flex items-center gap-1.5"
                        style={{ borderWidth: "1.5px" }}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2]" />
                        Acknowledge &amp; clear incident
                      </button>
                    ) : (
                      <span className="text-xs font-sans text-allow font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 stroke-[2]" /> Incident resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
