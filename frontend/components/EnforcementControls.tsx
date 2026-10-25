"use client";

import React, { useState } from "react";
import { Lock, ShieldAlert, CheckCircle2, XCircle, Clock, Check, X, AlertTriangle } from "lucide-react";

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
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.agent_id || "");
  const [containmentReason, setContainmentReason] = useState("");
  const [approvalNote, setApprovalNote] = useState("");

  const pendingApprovals = approvals.filter((a) => a.status === "PENDING");
  const historyApprovals = approvals.filter((a) => a.status !== "PENDING");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            Screen 6: Enforcement Controls & Approval Hold Queue
          </h2>
          <p className="text-xs text-slate-400">
            Independent out-of-agent containment: hold operations until human verification, pause agents, restrict tools, or isolate compromised identities.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Pending Verification: <strong className="text-amber-400">{pendingApprovals.length}</strong>
        </div>
      </div>

      {/* Pending Approvals Review Queue (Hold-Until-Approval Flow) */}
      <div className="p-5 rounded-xl border border-amber-900/60 bg-amber-950/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-base">Human-in-the-Loop Approval Queue</h3>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 font-mono border border-amber-700/50">
            Pre-Execution Hold
          </span>
        </div>

        <p className="text-xs text-slate-300">
          High-impact or threshold-exceeding operations remain technically blocked at the gateway until verified by an authorized operator.
        </p>

        {pendingApprovals.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs bg-slate-900/40 rounded-lg border border-slate-800">
            No pending approval holds. All live operations are either permitted or autonomously blocked.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((app) => (
              <div
                key={app.approval_id}
                className="p-4 rounded-lg bg-slate-900/90 border border-amber-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400 font-bold">{app.approval_id}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-white font-semibold">{app.agent_id}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 font-mono">{new Date(app.requested_at).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="font-bold text-slate-200 text-sm">{app.action_summary}</h4>
                  <div className="text-slate-400 font-mono text-[11px]">
                    Target Resource: <span className="text-cyan-300">{app.target_resource}</span> | Requested Tool: <span className="text-amber-300">{app.requested_tool}</span> | Volume: {app.data_volume}
                  </div>
                  {app.justification && (
                    <p className="text-slate-300 text-[11px] bg-slate-950 p-2 rounded border border-slate-800 mt-1">
                      {app.justification}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => onResolveApproval(app.approval_id, "APPROVE", "Operator verified legitimate task exception")}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve & Execute
                  </button>
                  <button
                    onClick={() => onResolveApproval(app.approval_id, "REJECT", "Operator denied out-of-role request")}
                    className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition"
                  >
                    <X className="w-3.5 h-3.5" /> Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agent Containment Actions Panel */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          Proportionate Agent Containment Controls
        </h3>
        <p className="text-xs text-slate-400">
          Instantly apply containment to any agent identity to suppress anomalous or compromised behavior without restarting services.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {agents.map((agent) => (
            <div
              key={agent.agent_id}
              className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{agent.name}</span>
                  <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
                    {agent.status}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono block">{agent.agent_id}</span>
                <span className="text-xs text-slate-400 block mt-1">{agent.role}</span>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                {agent.status === "active" ? (
                  <button
                    onClick={() => onUpdateStatus(agent.agent_id, "PAUSE", "Operator routine hold")}
                    className="px-2 py-1 rounded bg-amber-950/40 text-amber-300 border border-amber-800/50 hover:bg-amber-900/40 text-xs font-medium"
                  >
                    Pause Agent
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateStatus(agent.agent_id, "RESUME", "Operator cleared agent")}
                    className="px-2 py-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/40 text-xs font-medium"
                  >
                    Resume Active
                  </button>
                )}

                {agent.status !== "isolated" && (
                  <button
                    onClick={() => onUpdateStatus(agent.agent_id, "ISOLATE", "Suspected credential or identity drift compromise")}
                    className="px-2 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60 text-xs font-bold"
                  >
                    Isolate Agent
                  </button>
                )}

                {agent.status !== "restricted" && (
                  <button
                    onClick={() => onUpdateStatus(agent.agent_id, "RESTRICT", "Scoped operation restriction")}
                    className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                  >
                    Restrict Tools
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
