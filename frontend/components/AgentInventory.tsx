"use client";

import React, { useState } from "react";
import { Users, Shield, X } from "lucide-react";

interface AgentInventoryProps {
  agents: any[];
  onUpdateStatus: (agentId: string, action: string) => void;
}

export default function AgentInventory({ agents, onUpdateStatus }: AgentInventoryProps) {
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-3 py-1 rounded-full border-1.5 border-ink bg-allow text-white font-sans text-[11px] font-bold shadow-ink-sm" style={{ borderWidth: "1.5px" }}>
            Active
          </span>
        );
      case "paused":
        return (
          <span className="px-3 py-1 rounded-full border-1.5 border-ink bg-hold text-ink font-sans text-[11px] font-bold shadow-ink-sm" style={{ borderWidth: "1.5px" }}>
            Paused
          </span>
        );
      case "restricted":
        return (
          <span className="px-3 py-1 rounded-full border-1.5 border-ink bg-hold text-ink font-sans text-[11px] font-bold shadow-ink-sm" style={{ borderWidth: "1.5px" }}>
            Restricted
          </span>
        );
      case "isolated":
        return (
          <span className="px-3 py-1 rounded-full border-1.5 border-ink bg-pinkPrimary text-white font-sans text-[11px] font-bold shadow-pink" style={{ borderWidth: "1.5px" }}>
            Isolated
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full border-1.5 border-ink/40 bg-canvas text-ink font-sans text-[11px] font-medium" style={{ borderWidth: "1.5px" }}>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink/15 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
            <Users className="w-5 h-5 text-pinkPrimary stroke-[2]" />
            Agent identity &amp; role registry
          </h2>
          <p className="text-xs text-inkMuted font-sans mt-0.5">
            Registered baseline expected identities, permitted tool whitelists, and bounded data scopes
          </p>
        </div>
        <div className="text-xs font-sans text-ink">
          Total registered: <strong className="font-num font-bold tabular-nums text-pinkPrimary">{agents.length} agents</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {agents.map((agent) => {
          const isSelected = selectedAgent?.agent_id === agent.agent_id;
          return (
            <div
              key={agent.agent_id}
              onClick={() => setSelectedAgent(agent)}
              className={`p-6 bg-paper border-1.5 border-ink/80 rounded-3xl transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "shadow-pink ring-2 ring-pinkPrimary translate-x-[-1px] translate-y-[-1px]"
                  : "shadow-ink-sm hover:shadow-ink hover:translate-x-[-1px] hover:translate-y-[-1px]"
              }`}
              style={{ borderWidth: "1.5px" }}
            >
              <div>
                <div className="flex items-start justify-between border-b border-ink/10 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-ink text-base">{agent.name}</h3>
                    <span className="text-xs font-sans text-inkMuted block mt-0.5">{agent.agent_id}</span>
                  </div>
                  {getStatusBadge(agent.status)}
                </div>

                <div className="mt-4 space-y-2 text-xs font-sans text-ink">
                  <div className="flex items-center">
                    <span className="text-inkMuted w-24">Role:</span>
                    <strong className="text-ink font-semibold">{agent.role}</strong>
                  </div>
                  <div className="flex items-center">
                    <span className="text-inkMuted w-24">Department:</span>
                    <span>{agent.owner}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-inkMuted w-24">Policy version:</span>
                    <span className="font-num font-bold tabular-nums">v{agent.policy_version}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-inkMuted w-24">Review date:</span>
                    <span className="font-num tabular-nums">{agent.expiry_or_review_date}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-ink/10 text-xs font-sans">
                  <p className="text-ink/80 line-clamp-2">
                    <strong className="text-ink font-semibold">Purpose: </strong>
                    {agent.purpose}
                  </p>
                </div>

                {/* Scoped Tools Whitelist */}
                <div className="mt-4">
                  <span className="text-[11px] font-sans font-bold text-inkMuted block mb-1.5">
                    Authorized tools
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(agent.allowed_tools || []).map((tool: string) => (
                      <span
                        key={tool}
                        className="px-2.5 py-0.5 rounded-full border border-ink/20 bg-canvas text-ink font-sans text-[11px]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Containment Controls */}
              <div className="mt-5 pt-3.5 border-t border-ink/10 flex items-center justify-between text-xs font-sans">
                <span className="text-inkMuted text-[11px]">Enforcement</span>
                <div className="flex gap-2">
                  {agent.status === "active" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(agent.agent_id, "PAUSE");
                      }}
                      className="px-3 py-1 rounded-full border-1.5 border-ink bg-paper text-ink text-xs font-semibold hover:bg-hold hover:border-ink shadow-ink-sm transition-all"
                      style={{ borderWidth: "1.5px" }}
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(agent.agent_id, "RESUME");
                      }}
                      className="px-3 py-1 rounded-full border-1.5 border-ink bg-paper text-ink text-xs font-semibold hover:bg-allow hover:text-white hover:border-ink shadow-ink-sm transition-all"
                      style={{ borderWidth: "1.5px" }}
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
                      className="px-3 py-1 rounded-full border-1.5 border-pinkPrimary bg-paper text-pinkPrimary text-xs font-bold hover:bg-pinkPrimary hover:text-white shadow-pink transition-all"
                      style={{ borderWidth: "1.5px" }}
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

      {/* Selected Agent Deep Detail Drawer */}
      {selectedAgent && (
        <div className="p-7 bg-paper border-1.5 border-ink/80 rounded-3xl shadow-ink space-y-4" style={{ borderWidth: "1.5px" }}>
          <div className="flex items-center justify-between border-b border-ink/15 pb-3">
            <div>
              <h3 className="text-lg font-serif font-bold text-ink flex items-center gap-2">
                <Shield className="w-5 h-5 text-pinkPrimary stroke-[2]" />
                Identity card: {selectedAgent.name} ({selectedAgent.agent_id})
              </h3>
              <p className="text-xs text-inkMuted font-sans mt-0.5">
                Full registry definition and runtime authorization parameters
              </p>
            </div>
            <button
              onClick={() => setSelectedAgent(null)}
              className="p-1.5 rounded-full border border-ink/30 bg-canvas text-ink hover:bg-paper transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div className="p-5 bg-canvas/40 border border-ink/15 rounded-2xl space-y-3">
              <span className="text-[11px] font-bold text-ink block border-b border-ink/10 pb-1.5">
                Authorized boundaries
              </span>
              <div>
                <span className="text-inkMuted block text-[11px]">Task scope:</span>
                <span className="text-ink font-sans">{selectedAgent.task_scope}</span>
              </div>
              <div>
                <span className="text-inkMuted block text-[11px]">Risk profile:</span>
                <span className="text-ink font-semibold">{selectedAgent.risk_profile}</span>
              </div>
              <div>
                <span className="text-inkMuted block text-[11px]">Authorized data scope:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(selectedAgent.data_scope || []).map((ds: string) => (
                    <span key={ds} className="px-2 py-0.5 rounded-full border border-ink/20 bg-paper text-ink text-[11px]">
                      {ds}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 bg-canvas/40 border border-pinkPrimary/20 rounded-2xl space-y-3">
              <span className="text-[11px] font-bold text-pinkPrimary block border-b border-pinkPrimary/20 pb-1.5">
                Hard boundary prohibitions
              </span>
              <div>
                <span className="text-inkMuted block text-[11px]">Restricted tools:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(selectedAgent.restricted_tools || []).map((rt: string) => (
                    <span key={rt} className="px-2 py-0.5 rounded-full border border-pinkPrimary/40 bg-paper text-pinkPrimary font-semibold text-[11px]">
                      {rt}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-inkMuted block text-[11px]">Restricted operations:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(selectedAgent.restricted_actions || []).map((ra: string) => (
                    <span key={ra} className="px-2 py-0.5 rounded-full border border-pinkPrimary/40 bg-paper text-pinkPrimary font-semibold text-[11px]">
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
