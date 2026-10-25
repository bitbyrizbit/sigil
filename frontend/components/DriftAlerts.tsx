"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle, ShieldAlert, Sparkles, Filter, Check, ArrowRight, Eye } from "lucide-react";

interface DriftAlertsProps {
  alerts: any[];
  onResolveAlert: (alertId: string, status: string) => void;
}

export default function DriftAlerts({ alerts, onResolveAlert }: DriftAlertsProps) {
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);

  const filtered = alerts.filter((a) => {
    const matchesSev = filterSeverity === "ALL" || a.severity === filterSeverity;
    const matchesStat = filterStatus === "ALL" || a.status === filterStatus;
    return matchesSev && matchesStat;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Screen 3: Explainable Drift Alerts (USP 2)
          </h2>
          <p className="text-xs text-slate-400">
            Every alert explains what changed, why it matters, and which observed events support it—avoiding bare anomaly scores.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Open Incidents: <strong className="text-rose-400">{alerts.filter(a => a.status === "OPEN").length}</strong>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500 mr-1">Severity:</span>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                filterSeverity === sev
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500 mr-1">Status:</span>
          {["ALL", "OPEN", "RESOLVED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                filterStatus === st
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-500 text-sm">
            No alerts matching the selected filters.
          </div>
        ) : (
          filtered.map((alert) => {
            const isCritical = alert.severity === "CRITICAL";
            const isHigh = alert.severity === "HIGH";
            const isOpen = alert.status === "OPEN";

            return (
              <div
                key={alert.alert_id}
                className={`p-5 rounded-xl border transition ${
                  isOpen
                    ? isCritical
                      ? "border-rose-700/80 bg-rose-950/20 shadow-lg shadow-rose-950/30"
                      : isHigh
                      ? "border-amber-700/60 bg-amber-950/10"
                      : "border-slate-800 bg-slate-900/60"
                    : "border-slate-800/60 bg-slate-900/30 opacity-75"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                          isCritical
                            ? "bg-rose-900 text-rose-200 border border-rose-600"
                            : isHigh
                            ? "bg-amber-900/80 text-amber-200 border border-amber-600"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {alert.severity} Risk
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        Policy: {alert.policy_status || "prohibited"}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{alert.alert_id}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400 font-mono">
                        {alert.created_at ? new Date(alert.created_at).toLocaleString() : ""}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                      <span>{alert.agent_name}</span>
                      <span className="text-xs font-normal text-slate-400">({alert.role})</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Risk Score</div>
                      <div className="text-xl font-black text-rose-400 font-mono">{alert.risk_score} <span className="text-xs text-slate-500 font-normal">/ 100</span></div>
                    </div>
                    <div className="text-right pl-3 border-l border-slate-800">
                      <div className="text-xs text-slate-400">Confidence</div>
                      <div className="text-xl font-bold text-cyan-400 font-mono">{Math.round(alert.confidence * 100)}%</div>
                    </div>
                  </div>
                </div>

                {/* Evidence-Backed Explanation (USP 2 Core) */}
                <div className="mt-3.5 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Structured Evidence Explanation
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{alert.explanation}</p>
                </div>

                {/* Supporting Observed Evidence Points */}
                {alert.evidence && alert.evidence.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Observed Supporting Signals:
                    </span>
                    <ul className="space-y-1">
                      {alert.evidence.map((ev: string, idx: number) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 font-mono">
                          <span className="text-rose-400 mt-0.5">•</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Multi-Signal Breakdown (P, T, B, I, C) */}
                {alert.signals && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs font-mono">
                    <span className="text-slate-500 font-sans text-[11px]">Signals:</span>
                    <span className="text-slate-300">P (Policy): <strong className="text-rose-400">{alert.signals.P}</strong></span>
                    <span className="text-slate-300">T (Task): <strong className="text-amber-400">{alert.signals.T}</strong></span>
                    <span className="text-slate-300">B (Behavior): <strong className="text-cyan-400">{alert.signals.B}</strong></span>
                    <span className="text-slate-300">I (Impact): <strong className="text-purple-400">{alert.signals.I}</strong></span>
                    <span className="text-slate-300">C (Context): <strong className="text-indigo-400">{alert.signals.C}</strong></span>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Enforcement Action:</span>
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800 font-mono">
                      {alert.enforced_response}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOpen ? (
                      <button
                        onClick={() => onResolveAlert(alert.alert_id, "RESOLVED")}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Acknowledge & Resolve Incident
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Incident Resolved
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
