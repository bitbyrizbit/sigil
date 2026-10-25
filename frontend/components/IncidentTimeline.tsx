"use client";

import React, { useState } from "react";
import { GitFork, ShieldAlert, CheckCircle, Clock, ChevronDown, ChevronRight, User, Terminal, HelpCircle } from "lucide-react";

interface IncidentTimelineProps {
  timeline: any[];
}

export default function IncidentTimeline({ timeline }: IncidentTimelineProps) {
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-400" />
            Screen 4: Incident Timeline & Forensic Audit Store
          </h2>
          <p className="text-xs text-slate-400">
            Reconstruct incidents without trusting the agent&apos;s own explanation. Every entry answers the 9 forensic audit questions.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Audit Records: <strong className="text-indigo-400">{timeline.length}</strong>
        </div>
      </div>

      <div className="space-y-4">
        {timeline.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-500 text-sm">
            No audit records stored yet. Run threat scenarios to populate the forensic audit trail.
          </div>
        ) : (
          timeline.map((audit) => {
            const isExpanded = expandedAuditId === audit.audit_id;
            const isBlock = audit.decision === "BLOCK";
            const isHold = audit.decision === "HOLD_FOR_APPROVAL";

            return (
              <div
                key={audit.audit_id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition"
              >
                <div
                  onClick={() => setExpandedAuditId(isExpanded ? null : audit.audit_id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-slate-500">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">{audit.audit_id}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {audit.timestamp ? new Date(audit.timestamp).toLocaleString() : ""}
                        </span>
                        {audit.parent_agent_id && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-mono border border-indigo-800">
                            Delegated by: {audit.parent_agent_id}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">
                        Agent <span className="text-cyan-300 font-mono">{audit.agent_id}</span>: {audit.attempted_action}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{audit.explanation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center font-sans">
                    {isBlock ? (
                      <span className="px-2.5 py-1 rounded text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                        GATEWAY BLOCKED
                      </span>
                    ) : isHold ? (
                      <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                        APPROVAL HELD
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                        ALLOWED
                      </span>
                    )}
                  </div>
                </div>

                {/* 9 Forensic Questions Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 font-sans text-xs">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-semibold uppercase text-[11px] tracking-wider">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Module 7: Nine-Point Forensic Reconstruction
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-500 font-sans block">1. Which agent initiated?</span>
                        <strong className="text-white">{audit.agent_id}</strong>
                      </div>

                      <div>
                        <span className="text-slate-500 font-sans block">2. Who initiated the task / parent?</span>
                        <strong className="text-white">
                          User: {audit.initiating_user} {audit.parent_agent_id ? `| Parent: ${audit.parent_agent_id}` : ""}
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-500 font-sans block">3. What task was active?</span>
                        <strong className="text-cyan-300">{audit.task_id || "Unbound task"}</strong>
                        <span className="text-slate-400 block text-[10px] mt-0.5 truncate">
                          Scope: {JSON.stringify(audit.task_scope)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 font-sans block">4. What did the agent attempt to do?</span>
                        <strong className="text-amber-300">{audit.attempted_action}</strong>
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <span className="text-slate-500 font-sans block">5. Which policy & evidence evaluated?</span>
                        <span className="text-slate-400 block text-[10px]">Policy Version: {audit.policy_version}</span>
                        <ul className="space-y-0.5 mt-1">
                          {(audit.evaluated_rules || []).map((r: string, idx: number) => (
                            <li key={idx} className="text-slate-300 flex items-start gap-1">
                              <span className="text-rose-400">•</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <span className="text-slate-500 font-sans block">6. Why was action allowed/challenged/blocked?</span>
                        <span className="text-slate-200 font-sans">{audit.explanation}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 font-sans block">7. What actually happened at the tool?</span>
                        <strong className={isBlock ? "text-rose-400" : isHold ? "text-amber-400" : "text-emerald-400"}>
                          {audit.tool_execution_outcome}
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-500 font-sans block">8. Which containment action was taken?</span>
                        <strong className="text-slate-200">{audit.containment_action}</strong>
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <span className="text-slate-500 font-sans block">9. Who approved exception or resolved incident?</span>
                        <strong className="text-slate-300">
                          {audit.resolved_by ? `${audit.resolved_by} (${audit.resolution_notes || "Verified"})` : "None required (Pre-execution block or safe)"}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
