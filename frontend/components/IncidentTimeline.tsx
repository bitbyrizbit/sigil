"use client";

import React, { useState } from "react";
import { GitFork, ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import { DecisionStamp } from "./Stamp";
import { formatIST } from "../lib/formatTime";

interface IncidentTimelineProps {
  timeline: any[];
}

export default function IncidentTimeline({ timeline }: IncidentTimelineProps) {
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink/15 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
            <GitFork className="w-5 h-5 text-pinkPrimary stroke-[2]" />
            Forensic audit ledger (9-point reconstructor)
          </h2>
          <p className="text-xs text-inkMuted font-sans mt-0.5">
            Tamper-proof audit store answering the 9 forensic questions without trusting the agent&apos;s self-reported narrative
          </p>
        </div>
        <div className="text-xs font-sans text-ink">
          Recorded audits: <strong className="font-num font-bold tabular-nums text-pinkPrimary">{timeline.length} entries</strong>
        </div>
      </div>

      <div className="space-y-4">
        {timeline.length === 0 ? (
          <div className="text-center py-12 bg-paper border-1.5 border-ink/40 rounded-3xl shadow-sm text-inkMuted text-xs font-sans">
            No audit records stored yet. Run test scenarios or gateway simulations to populate the forensic trail.
          </div>
        ) : (
          timeline.map((audit) => {
            const isExpanded = expandedAuditId === audit.audit_id;

            return (
              <div
                key={audit.audit_id}
                className="bg-paper border-1.5 border-ink/80 rounded-3xl shadow-ink-sm hover:shadow-ink transition-all overflow-hidden"
                style={{ borderWidth: "1.5px" }}
              >
                <div
                  onClick={() => setExpandedAuditId(isExpanded ? null : audit.audit_id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-pinkPrimary">
                      {isExpanded ? <ChevronDown className="w-4 h-4 stroke-[2]" /> : <ChevronRight className="w-4 h-4 stroke-[2]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap font-sans text-xs">
                        <span className="font-num font-bold text-ink">{audit.audit_id}</span>
                        <span className="text-ink/30">•</span>
                        <span className="text-inkMuted font-num tabular-nums">
                          {formatIST(audit.timestamp)}
                        </span>
                        {audit.parent_agent_id && (
                          <span className="px-2.5 py-0.5 rounded-full border border-ink/20 bg-hold/30 text-ink text-[11px] font-semibold">
                            Delegated by: {audit.parent_agent_id}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-serif font-bold text-ink mt-1.5">
                        Agent <span className="text-pinkPrimary font-sans font-bold">{audit.agent_id}</span>: {audit.attempted_action}
                      </h4>
                      <p className="text-xs text-inkMuted font-sans mt-0.5 line-clamp-1">{audit.explanation}</p>
                    </div>
                  </div>

                  <div className="shrink-0 self-start sm:self-center">
                    <DecisionStamp decision={audit.decision} size="sm" />
                  </div>
                </div>

                {/* 9 Forensic Questions Drawer */}
                {isExpanded && (
                  <div className="p-6 bg-canvas/40 border-t border-ink/15 space-y-4 font-sans text-xs">
                    <div className="flex items-center gap-2 text-pinkPrimary font-sans font-bold text-xs">
                      <HelpCircle className="w-4 h-4 stroke-[2]" />
                      <span>Nine-point forensic audit reconstruction</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-paper p-5 rounded-2xl border border-ink/15 shadow-sm text-xs text-ink font-sans">
                      <div className="border-b border-ink/10 pb-2.5">
                        <span className="text-inkMuted block text-[11px] font-semibold mb-0.5">1. Which agent initiated?</span>
                        <strong className="text-ink text-xs">{audit.agent_id}</strong>
                      </div>

                      <div className="border-b border-ink/10 pb-2.5">
                        <span className="text-inkMuted block text-[11px] font-semibold mb-0.5">2. Who initiated the task / parent?</span>
                        <strong className="text-ink text-xs">
                          {audit.initiating_user} {audit.parent_agent_id ? `(Delegated via ${audit.parent_agent_id})` : ""}
                        </strong>
                      </div>

                      <div className="border-b border-ink/10 pb-2.5">
                        <span className="text-inkMuted block text-[11px] font-semibold mb-0.5">3. What task was active?</span>
                        <strong className="text-ink">{audit.task_id || "Unbound task context"}</strong>
                        <span className="text-inkMuted block text-[11px] truncate mt-0.5 font-num">
                          Scope: {JSON.stringify(audit.task_scope)}
                        </span>
                      </div>

                      <div className="border-b border-ink/10 pb-2.5">
                        <span className="text-inkMuted block text-[11px] font-semibold mb-0.5">4. What did the agent attempt to do?</span>
                        <strong className="text-ink">{audit.attempted_action}</strong>
                      </div>

                      <div className="col-span-1 md:col-span-2 border-b border-ink/10 pb-2.5">
                        <span className="text-inkMuted block text-[11px] font-semibold mb-0.5">5. Which policy &amp; rules were evaluated?</span>
                        <span className="text-inkMuted block text-[11px] font-num">Policy version: v{audit.policy_version}</span>
                        <ul className="space-y-1 mt-1 font-sans">
                          {(audit.evaluated_rules || []).map((r: string, idx: number) => (
                            <li key={idx} className="text-ink/90 flex items-start gap-2">
                              <span className="text-pinkPrimary font-bold">»</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="col-span-1 md:col-span-2 border-b border-ink/10 pb-2.5">
                        <span className="text-inkMuted block text-[11px] font-semibold mb-0.5">6. Why was action allowed, challenged, or blocked?</span>
                        <span className="text-ink font-sans text-xs leading-relaxed">{audit.explanation}</span>
                      </div>

                      <div>
                        <span className="text-inkMuted block text-[11px] font-semibold mb-0.5">7. What actually happened at the tool?</span>
                        <strong className="text-ink text-xs">
                          {audit.tool_execution_outcome}
                        </strong>
                      </div>

                      <div>
                        <span className="text-inkMuted block text-[11px] font-semibold mb-0.5">8. Which containment was enforced?</span>
                        <strong className="text-ink text-xs">{audit.containment_action}</strong>
                      </div>

                      <div className="col-span-1 md:col-span-2 pt-1">
                        <span className="text-inkMuted block text-[11px] font-semibold mb-0.5">9. Who approved exception or resolved incident?</span>
                        <strong className="text-ink text-xs">
                          {audit.resolved_by ? `${audit.resolved_by} (${audit.resolution_notes || "Verified"})` : "None required (Pre-execution block or safe execution)"}
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
