"use client";

import React from "react";
import { Lock, ShieldAlert, Clock, Check, X } from "lucide-react";
import { DecisionStamp } from "./Stamp";

interface EnforcementProps {
  agents: any[];
  approvals: any[];
  onUpdateStatus: (agentId: string, action: string, reason?: string) => void;
  onResolveApproval: (approvalId: string, action: "APPROVE" | "REJECT", justification?: string) => void;
}

export default function EnforcementControls({
  agents,
  approvals,
  onUpdateStatus,
  onResolveApproval,
}: EnforcementProps) {
  const pendingApprovals = approvals.filter((a) => a.status === "PENDING");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink/15 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
            <Lock className="w-5 h-5 text-pinkPrimary stroke-[2]" />
            Enforcement &amp; approval hold queue
          </h2>
          <p className="text-xs text-inkMuted font-sans mt-0.5">
            Hold boundary-burst actions until operator signoff, restrict tools, or isolate compromised agent identities
          </p>
        </div>
        <div className="text-xs font-sans text-ink">
          Pending verification: <strong className="font-num font-bold tabular-nums text-pinkPrimary">{pendingApprovals.length}</strong>
        </div>
      </div>

      {/* Human-in-the-Loop Hold Queue */}
      <div className="p-7 bg-paper border-1.5 border-ink/80 rounded-3xl shadow-ink space-y-4" style={{ borderWidth: "1.5px" }}>
        <div className="flex items-center justify-between border-b border-ink/10 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-pinkPrimary stroke-[2]" />
            <h3 className="font-serif font-bold text-ink text-base">Human-in-the-loop approval queue</h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full border border-ink/20 bg-hold text-ink font-sans font-bold shadow-sm">
            Pre-execution hold
          </span>
        </div>

        <p className="text-xs text-inkMuted font-sans leading-relaxed">
          Operations exceeding dollar limits (\$5,000 for Finance, \$150 for Support) or volume thresholds remain technically suspended at the gateway until explicitly approved by an authenticated operator.
        </p>

        {pendingApprovals.length === 0 ? (
          <div className="text-center py-10 text-inkMuted text-xs font-sans bg-canvas/40 border border-ink/15 rounded-2xl">
            No pending approval holds. All live operations are either compliant or autonomously suppressed.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((app) => (
              <div
                key={app.approval_id}
                className="p-5 bg-canvas/40 border border-ink/20 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans"
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-num font-bold text-ink">{app.approval_id}</span>
                    <span className="text-ink/30">•</span>
                    <strong className="text-pinkPrimary font-semibold">{app.agent_id}</strong>
                    <span className="text-ink/30">•</span>
                    <span className="text-inkMuted font-num tabular-nums">{new Date(app.requested_at).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="font-serif font-bold text-ink text-sm">{app.action_summary}</h4>
                  <div className="text-inkMuted text-[11px]">
                    Target: <span className="font-semibold text-ink">{app.target_resource}</span> | Tool: <span className="font-semibold text-ink">{app.requested_tool}</span> | Volume: <span className="font-num tabular-nums">{app.data_volume} items</span>
                  </div>
                  {app.justification && (
                    <p className="text-ink text-[11px] bg-paper p-3 rounded-xl border border-ink/15 mt-1.5">
                      {app.justification}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2.5 self-start md:self-center shrink-0 font-sans text-xs">
                  <button
                    onClick={() => onResolveApproval(app.approval_id, "APPROVE", "Operator approved verified exception")}
                    className="px-4 py-2 bg-allow text-white rounded-full font-bold shadow-sm hover:opacity-90 active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2]" /> Approve &amp; release
                  </button>
                  <button
                    onClick={() => onResolveApproval(app.approval_id, "REJECT", "Operator rejected out-of-role action")}
                    className="px-4 py-2 bg-fuchsia text-white rounded-full font-bold shadow-sm hover:opacity-90 active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2]" /> Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agent Containment Actions Panel */}
      <div className="p-7 bg-paper border-1.5 border-ink/80 rounded-3xl shadow-ink space-y-4" style={{ borderWidth: "1.5px" }}>
        <h3 className="font-serif font-bold text-ink text-base flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-pinkPrimary stroke-[2]" />
          Proportionate agent containment controls
        </h3>
        <p className="text-xs text-inkMuted font-sans">
          Apply immediate isolation or operational pauses to individual agent identities without restarting background runtimes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {agents.map((agent) => (
            <div
              key={agent.agent_id}
              className="p-5 bg-canvas/40 border border-ink/20 rounded-2xl shadow-sm flex flex-col justify-between space-y-3 font-sans"
            >
              <div>
                <div className="flex items-center justify-between border-b border-ink/10 pb-2">
                  <span className="font-serif font-bold text-ink text-sm">{agent.name}</span>
                  <DecisionStamp decision={agent.status} size="sm" />
                </div>
                <span className="text-xs text-inkMuted block mt-1.5">{agent.agent_id}</span>
                <span className="text-xs text-ink font-semibold block mt-0.5">{agent.role}</span>
              </div>

              <div className="pt-3 border-t border-ink/10 flex flex-wrap gap-2 text-xs">
                {agent.status === "active" ? (
                  <button
                    onClick={() => onUpdateStatus(agent.agent_id, "PAUSE", "Operator routine hold")}
                    className="px-3.5 py-1.5 rounded-full border-1.5 border-ink bg-paper text-ink font-semibold hover:bg-hold hover:border-ink shadow-ink-sm transition-all"
                    style={{ borderWidth: "1.5px" }}
                  >
                    Pause agent
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateStatus(agent.agent_id, "RESUME", "Operator cleared agent")}
                    className="px-3.5 py-1.5 rounded-full border-1.5 border-ink bg-paper text-ink font-semibold hover:bg-allow hover:text-white hover:border-ink shadow-ink-sm transition-all"
                    style={{ borderWidth: "1.5px" }}
                  >
                    Resume active
                  </button>
                )}

                {agent.status !== "isolated" && (
                  <button
                    onClick={() => onUpdateStatus(agent.agent_id, "ISOLATE", "Suspected identity compromise")}
                    className="px-3.5 py-1.5 rounded-full border-1.5 border-pinkPrimary bg-paper text-pinkPrimary font-bold hover:bg-pinkPrimary hover:text-white shadow-pink transition-all"
                    style={{ borderWidth: "1.5px" }}
                  >
                    Isolate agent
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
