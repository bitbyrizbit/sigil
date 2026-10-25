"use client";

import React from "react";
import { Users, AlertTriangle, ShieldAlert, Clock, ArrowUpRight, CheckCircle2, XCircle, AlertCircle, PlayCircle } from "lucide-react";

interface OverviewProps {
  summary: {
    registered_agents: number;
    open_alerts: number;
    blocked_actions: number;
    pending_reviews: number;
  };
  recentEvents: any[];
  setActiveTab: (tab: string) => void;
  onOpenSimulate: () => void;
  onRunScenarios: () => void;
}

export default function OverviewPanel({
  summary,
  recentEvents,
  setActiveTab,
  onOpenSimulate,
  onRunScenarios,
}: OverviewProps) {
  return (
    <div className="space-y-6">
      {/* Banner / Strategic Thesis */}
      <div className="p-5 rounded-xl border border-cyan-900/40 bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">Runtime Enforcement Architecture</span>
              <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                Context-Aware Identity Drift Detection & Response
              </h1>
              <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
                Autonomous AI agents can perform out-of-role actions even with valid credentials. Sigil acts as an independent
                security proxy outside the agent—intercepting every tool call, scoring intent against active task scope, and
                enforcing technical blocks or approval holds before execution.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start md:self-center">
              <button
                onClick={onRunScenarios}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
              >
                <PlayCircle className="w-4 h-4" />
                Run Threat Scenarios
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Gateway Interceptor: <strong>Active (Simulated Tool Boundary)</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Scoring Model: <strong>Multi-Signal \(R = 100 \times [0.35P + 0.25T + 0.15B + 0.15I + 0.10C]\)</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              Audit Trail: <strong>Tamper-Evident Out-of-Agent Store</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div
          onClick={() => setActiveTab("agents")}
          className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-900/90 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Registered Agents</span>
            <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 group-hover:scale-105 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">{summary.registered_agents}</span>
            <span className="text-xs text-cyan-400 flex items-center font-medium">
              View Inventory <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Research, Finance, Support + dynamic</p>
        </div>

        {/* Card 2 */}
        <div
          onClick={() => setActiveTab("alerts")}
          className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-rose-500/40 hover:bg-slate-900/90 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Open Drift Alerts</span>
            <div className="p-2 rounded-lg bg-rose-950/40 text-rose-400 group-hover:scale-105 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">{summary.open_alerts}</span>
            <span className="text-xs text-rose-400 flex items-center font-medium">
              Investigate <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Evidence-backed out-of-role alerts</p>
        </div>

        {/* Card 3 */}
        <div
          onClick={() => setActiveTab("activity")}
          className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-amber-500/40 hover:bg-slate-900/90 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Blocked Actions</span>
            <div className="p-2 rounded-lg bg-amber-950/40 text-amber-400 group-hover:scale-105 transition">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">{summary.blocked_actions}</span>
            <span className="text-xs text-amber-400 flex items-center font-medium">
              View Stream <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Pre-execution technical gateway stops</p>
        </div>

        {/* Card 4 */}
        <div
          onClick={() => setActiveTab("enforcement")}
          className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/40 hover:bg-slate-900/90 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Reviews</span>
            <div className="p-2 rounded-lg bg-indigo-950/40 text-indigo-400 group-hover:scale-105 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">{summary.pending_reviews}</span>
            <span className="text-xs text-indigo-400 flex items-center font-medium">
              Review Queue <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Held until human approval verified</p>
        </div>
      </div>

      {/* Recent Security Events Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Recent Security Interceptions</h2>
            <p className="text-xs text-slate-400">Live activity observed and enforced at the tool boundary</p>
          </div>
          <button
            onClick={() => setActiveTab("activity")}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center"
          >
            All Live Events <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {recentEvents.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            No events recorded yet. Click &quot;Run Threat Scenarios&quot; or use the &quot;Gateway Simulator&quot; to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-900/50">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Agent / Role</th>
                  <th className="py-2.5 px-3 font-semibold">Attempted Tool & Operation</th>
                  <th className="py-2.5 px-3 font-semibold">Target Resource</th>
                  <th className="py-2.5 px-3 font-semibold">Risk Score</th>
                  <th className="py-2.5 px-3 font-semibold">Gateway Decision</th>
                  <th className="py-2.5 px-3 font-semibold">Execution Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {recentEvents.map((evt) => {
                  const isBlock = evt.decision === "BLOCK";
                  const isHold = evt.decision === "HOLD_FOR_APPROVAL";
                  const isAllow = evt.decision === "ALLOW";

                  return (
                    <tr key={evt.event_id} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : "--:--:--"}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-sans">
                        <span className="font-semibold text-white">{evt.agent_name}</span>
                        <span className="text-[11px] text-slate-400 block">{evt.role}</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                          {evt.tool_name}
                        </span>
                        <span className="text-slate-500 text-[11px] ml-1.5 font-sans">({evt.operation_type})</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={evt.target_resource}>
                        {evt.target_resource}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            evt.risk_score >= 70
                              ? "text-rose-400"
                              : evt.risk_score >= 40
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {evt.risk_score} / 100
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-sans">
                        {isBlock && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/60 text-rose-400 border border-rose-800/50">
                            <XCircle className="w-3 h-3 mr-1" /> BLOCKED
                          </span>
                        )}
                        {isHold && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/50">
                            <AlertCircle className="w-3 h-3 mr-1" /> HELD (REVIEW)
                          </span>
                        )}
                        {isAllow && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> ALLOWED
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-sans text-xs">
                        {evt.result === "allowed" || evt.result === "succeeded" ? (
                          <span className="text-emerald-400 font-medium">Tool Executed</span>
                        ) : evt.result === "pending_approval" ? (
                          <span className="text-amber-400 font-medium">Awaiting Human Signoff</span>
                        ) : (
                          <span className="text-rose-400 font-medium">Pre-execution Suppressed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
