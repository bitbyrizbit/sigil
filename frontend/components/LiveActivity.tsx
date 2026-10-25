"use client";

import React, { useState } from "react";
import { Activity, Search, Filter, ShieldCheck, ShieldAlert, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";

interface LiveActivityProps {
  events: any[];
}

export default function LiveActivity({ events }: LiveActivityProps) {
  const [search, setSearch] = useState("");
  const [filterDecision, setFilterDecision] = useState("ALL");
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const filtered = events.filter((e) => {
    const matchesSearch =
      e.agent_id.toLowerCase().includes(search.toLowerCase()) ||
      e.tool_name.toLowerCase().includes(search.toLowerCase()) ||
      e.target_resource.toLowerCase().includes(search.toLowerCase()) ||
      (e.destination && e.destination.toLowerCase().includes(search.toLowerCase()));

    const matchesDecision = filterDecision === "ALL" || e.authorization_decision === filterDecision;
    return matchesSearch && matchesDecision;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Screen 2: Runtime Tool Gateway Activity Stream
          </h2>
          <p className="text-xs text-slate-400">
            Real-time searchable telemetry stream captured at the tool execution boundary.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Showing {filtered.length} of {events.length} events</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agent, tool, resource..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {["ALL", "BLOCK", "HOLD_FOR_APPROVAL", "ALLOW"].map((dec) => (
            <button
              key={dec}
              onClick={() => setFilterDecision(dec)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                filterDecision === dec
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {dec === "ALL" ? "All" : dec === "HOLD_FOR_APPROVAL" ? "Held" : dec}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-900/70 font-sans">
              <tr>
                <th className="py-2.5 px-3"></th>
                <th className="py-2.5 px-3 font-semibold">Event ID</th>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Agent ID</th>
                <th className="py-2.5 px-3 font-semibold">Tool & Op</th>
                <th className="py-2.5 px-3 font-semibold">Target Resource</th>
                <th className="py-2.5 px-3 font-semibold">Volume</th>
                <th className="py-2.5 px-3 font-semibold">Decision</th>
                <th className="py-2.5 px-3 font-semibold">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((e) => {
                const isExpanded = expandedEventId === e.event_id;
                const isBlock = e.authorization_decision === "BLOCK";
                const isHold = e.authorization_decision === "HOLD_FOR_APPROVAL";

                return (
                  <React.Fragment key={e.event_id}>
                    <tr
                      onClick={() => setExpandedEventId(isExpanded ? null : e.event_id)}
                      className="hover:bg-slate-800/40 cursor-pointer transition"
                    >
                      <td className="py-2.5 px-2 text-slate-500">
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </td>
                      <td className="py-2.5 px-3 text-cyan-400 font-semibold">{e.event_id}</td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : "--"}
                      </td>
                      <td className="py-2.5 px-3 text-slate-200">{e.agent_id}</td>
                      <td className="py-2.5 px-3 text-slate-300">
                        <span className="font-semibold text-white">{e.tool_name}</span>
                        <span className="text-slate-500 text-[10px] ml-1 font-sans">({e.operation_type})</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={e.target_resource}>
                        {e.target_resource}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{e.data_volume} items</td>
                      <td className="py-2.5 px-3 font-sans">
                        {isBlock ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/70 text-rose-300 border border-rose-800/50">
                            BLOCK
                          </span>
                        ) : isHold ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-800/50">
                            HOLD
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/50">
                            ALLOW
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-xs">
                        <span
                          className={`font-medium ${
                            e.result === "allowed" || e.result === "succeeded"
                              ? "text-emerald-400"
                              : e.result === "pending_approval"
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {e.result}
                        </span>
                      </td>
                    </tr>

                    {/* Detailed Accordion Row */}
                    {isExpanded && (
                      <tr className="bg-slate-950/70">
                        <td colSpan={9} className="p-4 border-t border-slate-800">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div className="space-y-1">
                              <span className="text-slate-400 font-sans font-semibold uppercase text-[10px]">Session & User</span>
                              <div>Initiating User: <strong className="text-slate-200">{e.initiating_user}</strong></div>
                              <div>Session ID: <span className="text-slate-300">{e.session_id}</span></div>
                              {e.parent_agent_id && <div>Parent Agent: <span className="text-indigo-400 font-bold">{e.parent_agent_id}</span></div>}
                              <div>Task ID: <span className="text-slate-300">{e.task_id || "Unassigned"}</span></div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-slate-400 font-sans font-semibold uppercase text-[10px]">Target & Security</span>
                              <div>Sensitivity: <span className="text-amber-400 font-semibold">{e.resource_sensitivity}</span></div>
                              <div>Destination: <span className="text-slate-300">{e.destination || "None (internal)"}</span></div>
                              <div>Policy Version: <span className="text-cyan-400">{e.policy_version}</span></div>
                              <div>Risk Score: <span className="text-rose-400 font-bold">{e.risk_score}/100</span></div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-slate-400 font-sans font-semibold uppercase text-[10px]">Provenance & Action Params</span>
                              <div className="bg-slate-900 p-2 rounded border border-slate-800 overflow-x-auto max-h-24">
                                <span className="text-[10px] text-slate-500 block">Params:</span>
                                <code>{JSON.stringify(e.action_parameters || {}, null, 1)}</code>
                                {e.input_provenance && (
                                  <>
                                    <span className="text-[10px] text-slate-500 block mt-1">Input Provenance:</span>
                                    <code className="text-amber-300">{JSON.stringify(e.input_provenance, null, 1)}</code>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
