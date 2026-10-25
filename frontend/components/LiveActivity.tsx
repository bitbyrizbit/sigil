"use client";

import React, { useState } from "react";
import { Activity, Search, ChevronDown, ChevronRight } from "lucide-react";
import { DecisionStamp } from "./Stamp";

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink/15 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
            <Activity className="w-5 h-5 text-pinkPrimary stroke-[2]" />
            Runtime activity stream
          </h2>
          <p className="text-xs text-inkMuted font-sans mt-0.5">
            Real-time ledger of tool invocations captured and evaluated at the gateway boundary
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-sans text-ink">
          <span>Showing <strong className="font-num font-bold tabular-nums text-pinkPrimary">{filtered.length}</strong> of <strong className="font-num font-bold tabular-nums">{events.length}</strong> telemetry records</span>
        </div>
      </div>

      {/* Filter and Search Bar: Rounded pills */}
      <div className="p-4 bg-paper border-1.5 border-ink/80 rounded-3xl shadow-ink-sm flex flex-col sm:flex-row gap-3 items-center justify-between" style={{ borderWidth: "1.5px" }}>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-inkMuted absolute left-3.5 top-3 stroke-[2]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agent, tool, resource..."
            className="w-full bg-canvas border border-ink/30 rounded-full pl-10 pr-4 py-2 text-xs text-ink placeholder-inkMuted focus:outline-none focus:border-pinkPrimary focus:bg-paper font-sans"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto font-sans text-xs flex-wrap">
          {[
            { id: "ALL", label: "All" },
            { id: "ALLOW", label: "Allowed" },
            { id: "HOLD_FOR_APPROVAL", label: "Held for review" },
            { id: "BLOCK", label: "Blocked" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterDecision(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                filterDecision === item.id
                  ? "bg-pinkPrimary text-white font-bold border-pinkPrimary shadow-pink"
                  : "bg-paper text-ink border-ink/20 hover:border-ink/50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-paper border-1.5 border-ink/80 rounded-3xl shadow-ink overflow-hidden" style={{ borderWidth: "1.5px" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead className="text-[11px] font-sans font-bold text-inkMuted bg-canvas/40 border-b border-ink/15">
              <tr>
                <th className="py-3 px-3 w-8"></th>
                <th className="py-3 px-3">Event ID</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Agent</th>
                <th className="py-3 px-3">Tool &amp; operation</th>
                <th className="py-3 px-3">Target resource</th>
                <th className="py-3 px-3">Volume</th>
                <th className="py-3 px-3">Decision</th>
                <th className="py-3 px-3">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 text-ink">
              {filtered.map((e) => {
                const isExpanded = expandedEventId === e.event_id;

                return (
                  <React.Fragment key={e.event_id}>
                    <tr
                      onClick={() => setExpandedEventId(isExpanded ? null : e.event_id)}
                      className="hover:bg-canvas/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 text-inkMuted text-center">
                        {isExpanded ? <ChevronDown className="w-4 h-4 mx-auto text-pinkPrimary" /> : <ChevronRight className="w-4 h-4 mx-auto" />}
                      </td>
                      <td className="py-3 px-3 font-num font-semibold text-ink whitespace-nowrap">{e.event_id}</td>
                      <td className="py-3 px-3 text-inkMuted font-num tabular-nums whitespace-nowrap">
                        {e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : "--"}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-medium">{e.agent_id}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold bg-canvas px-2.5 py-0.5 rounded-full border border-ink/20">
                          {e.tool_name}
                        </span>
                        <span className="text-inkMuted text-[11px] ml-1.5">({e.operation_type})</span>
                      </td>
                      <td className="py-3 px-3 text-ink max-w-xs truncate" title={e.target_resource}>
                        {e.target_resource}
                      </td>
                      <td className="py-3 px-3 text-inkMuted font-num tabular-nums whitespace-nowrap">{e.data_volume} items</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <DecisionStamp decision={e.authorization_decision} size="sm" />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-xs">
                        {e.result === "allowed" || e.result === "succeeded" ? (
                          <span className="text-allow font-semibold">Tool executed</span>
                        ) : e.result === "pending_approval" ? (
                          <span className="text-ink font-medium bg-hold/30 px-2 py-0.5 rounded-full border border-ink/30">Awaiting operator signoff</span>
                        ) : (
                          <span className="text-fuchsia font-semibold">Pre-execution suppressed</span>
                        )}
                      </td>
                    </tr>

                    {/* Detailed Accordion Row */}
                    {isExpanded && (
                      <tr className="bg-canvas/50">
                        <td colSpan={9} className="p-5 border-t border-b border-ink/15 text-xs font-sans">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 bg-paper p-4 rounded-2xl border border-ink/15 shadow-sm">
                              <span className="text-pinkPrimary font-sans font-bold text-[11px] block border-b border-ink/10 pb-1.5">
                                Context &amp; authority
                              </span>
                              <div>Initiating user: <strong className="text-ink">{e.initiating_user}</strong></div>
                              <div>Session: <span className="text-inkMuted font-num tabular-nums">{e.session_id}</span></div>
                              {e.parent_agent_id && <div>Parent agent: <span className="text-pinkPrimary font-bold">{e.parent_agent_id}</span></div>}
                              <div>Task reference: <span className="text-inkMuted font-num tabular-nums">{e.task_id || "None"}</span></div>
                            </div>

                            <div className="space-y-2 bg-paper p-4 rounded-2xl border border-ink/15 shadow-sm">
                              <span className="text-pinkPrimary font-sans font-bold text-[11px] block border-b border-ink/10 pb-1.5">
                                Security &amp; risk score
                              </span>
                              <div>Sensitivity: <strong className="text-ink">{e.resource_sensitivity}</strong></div>
                              <div>Destination: <span className="text-inkMuted">{e.destination || "Internal"}</span></div>
                              <div>Policy version: <span className="font-num font-bold tabular-nums">v{e.policy_version}</span></div>
                              <div>Evaluated risk: <span className="font-num font-bold text-fuchsia tabular-nums">{e.risk_score} / 100</span></div>
                            </div>

                            <div className="space-y-2 bg-paper p-4 rounded-2xl border border-ink/15 shadow-sm overflow-hidden">
                              <span className="text-pinkPrimary font-sans font-bold text-[11px] block border-b border-ink/10 pb-1.5">
                                Action parameters &amp; provenance
                              </span>
                              <div className="max-h-24 overflow-y-auto text-[11px]">
                                <span className="text-inkMuted text-[10px] block">Parameters:</span>
                                <div className="font-num text-[11px] bg-canvas p-2 rounded-xl mt-1 text-ink">{JSON.stringify(e.action_parameters || {}, null, 1)}</div>
                                {e.input_provenance && (
                                  <>
                                    <span className="text-inkMuted text-[10px] block mt-2">Input provenance:</span>
                                    <div className="font-num text-[11px] bg-canvas p-2 rounded-xl mt-1 text-pinkPrimary">{JSON.stringify(e.input_provenance, null, 1)}</div>
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
