"use client";

import React, { useState } from "react";
import { Users, Shield, Check, X, ShieldAlert, AlertTriangle, Key, Calendar, Tag } from "lucide-react";

interface AgentInventoryProps {
  agents: any[];
  onUpdateStatus: (agentId: string, action: string) => void;
}

export default function AgentInventory({ agents, onUpdateStatus }: AgentInventoryProps) {
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">Active</span>;
      case "paused":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/40">Paused</span>;
      case "restricted":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-950/60 text-orange-400 border border-orange-800/40">Restricted</span>;
      case "isolated":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/60 text-rose-400 border border-rose-800/40">Isolated</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Screen 1: Agent Identity & Role Registry
          </h2>
          <p className="text-xs text-slate-400">
            Baseline expected identities, scoped tools, data boundaries, and risk profiles before runtime observation.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Total Registered: <strong className="text-cyan-400">{agents.length}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {agents.map((agent) => {
          const isSelected = selectedAgent?.agent_id === agent.agent_id;
          return (
            <div
              key={agent.agent_id}
              onClick={() => setSelectedAgent(agent)}
              className={`p-5 rounded-xl border bg-slate-900/60 transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-cyan-500 shadow-lg shadow-cyan-500/10 bg-slate-900"
                  : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{agent.name}</h3>
                    <span className="text-xs font-mono text-cyan-400 block">{agent.agent_id}</span>
                  </div>
                  {getStatusBadge(agent.status)}
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center text-slate-300">
                    <span className="text-slate-500 w-24">Role:</span>
                    <strong className="text-slate-200">{agent.role}</strong>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <span className="text-slate-500 w-24">Department:</span>
                    <span>{agent.owner}</span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <span className="text-slate-500 w-24">Policy Version:</span>
                    <span className="font-mono text-cyan-300">v{agent.policy_version}</span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <span className="text-slate-500 w-24">Review Date:</span>
                    <span className="font-mono text-slate-400">{agent.expiry_or_review_date}</span>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-800 text-xs">
                  <p className="text-slate-400 line-clamp-2">
                    <strong className="text-slate-300 font-medium">Purpose: </strong>
                    {agent.purpose}
                  </p>
                </div>

                {/* Scoped Tools Pills */}
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Permitted Tools Whitelist
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(agent.allowed_tools || []).map((tool: string) => (
                      <span key={tool} className="px-1.5 py-0.5 rounded bg-slate-800/80 text-emerald-400 font-mono text-[10px] border border-emerald-950">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Containment Controls */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Security State</span>
                <div className="flex gap-1.5">
                  {agent.status === "active" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(agent.agent_id, "PAUSE");
                      }}
                      className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 hover:bg-amber-900/40 text-[11px]"
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(agent.agent_id, "RESUME");
                      }}
                      className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/40 text-[11px]"
                    >
                      Resume
                    </button>
                  )}
                  {agent.status !== "isolated" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(agent.agent_id, "ISOLATE");
                      }}
                      className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/40 text-[11px]"
                    >
                      Isolate
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Deep Detail Drawer / Modal */}
      {selectedAgent && (
        <div className="p-5 rounded-xl border border-cyan-800/60 bg-slate-900/90 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Detailed Policy Profile: {selectedAgent.name} ({selectedAgent.agent_id})
              </h3>
              <p className="text-xs text-slate-400">All registered registry fields from Module 1 specification</p>
            </div>
            <button
              onClick={() => setSelectedAgent(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold text-cyan-400 font-sans uppercase">Scope & Boundaries</span>
              <div>
                <span className="text-slate-500 block">Active Task Scope:</span>
                <span className="text-slate-200">{selectedAgent.task_scope}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Risk Profile:</span>
                <span className="text-amber-300 font-semibold">{selectedAgent.risk_profile}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Authorized Data Scope:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(selectedAgent.data_scope || []).map((ds: string) => (
                    <span key={ds} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {ds}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold text-rose-400 font-sans uppercase">Strict Prohibitions</span>
              <div>
                <span className="text-slate-500 block">Restricted Tools:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(selectedAgent.restricted_tools || []).map((rt: string) => (
                    <span key={rt} className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/60">
                      {rt}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Restricted Operations:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(selectedAgent.restricted_actions || []).map((ra: string) => (
                    <span key={ra} className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/60">
                      {ra}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
