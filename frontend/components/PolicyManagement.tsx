"use client";

import React, { useState } from "react";
import { BookOpen, Edit3, Check, Plus, Shield, Sliders } from "lucide-react";

interface PolicyManagementProps {
  policiesData: {
    policies: any[];
    active_tasks: any[];
  };
  onUpdatePolicy: (payload: any) => Promise<void>;
}

export default function PolicyManagement({ policiesData, onUpdatePolicy }: PolicyManagementProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    policiesData.policies[0]?.agent_id || "agent_research_01"
  );
  const [editing, setEditing] = useState(false);
  const [newAllowedTool, setNewAllowedTool] = useState("");
  const [newScopeItem, setNewScopeItem] = useState("");

  const activePolicy = policiesData.policies.find((p) => p.agent_id === selectedAgentId);
  const activeTask = policiesData.active_tasks.find((t) => t.agent_id === selectedAgentId);

  const handleAddTool = async () => {
    if (!newAllowedTool.trim() || !activePolicy) return;
    const updated = [...(activePolicy.allowed_tools || []), newAllowedTool.trim()];
    await onUpdatePolicy({
      agent_id: activePolicy.agent_id,
      allowed_tools: updated,
      policy_version: `${(parseFloat(activePolicy.policy_version) + 0.1).toFixed(1)}`,
    });
    setNewAllowedTool("");
  };

  const handleAddDataScope = async () => {
    if (!newScopeItem.trim() || !activePolicy) return;
    const updated = [...(activePolicy.data_scope || []), newScopeItem.trim()];
    await onUpdatePolicy({
      agent_id: activePolicy.agent_id,
      data_scope: updated,
      policy_version: `${(parseFloat(activePolicy.policy_version) + 0.1).toFixed(1)}`,
    });
    setNewScopeItem("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Screen 5: Policy & Scope Management
          </h2>
          <p className="text-xs text-slate-400">
            Define and dynamically update enforceable boundaries, tools whitelist, data scopes, and task scopes (Scenario F).
          </p>
        </div>
      </div>

      {/* Select Agent Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {policiesData.policies.map((p) => (
          <button
            key={p.agent_id}
            onClick={() => setSelectedAgentId(p.agent_id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedAgentId === p.agent_id
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {p.name} ({p.agent_id})
          </button>
        ))}
      </div>

      {activePolicy && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Policy Profile Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  Policy Rules: {activePolicy.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Enforceable Policy Version: <strong className="text-cyan-300">v{activePolicy.policy_version}</strong>
                </span>
              </div>
            </div>

            {/* Allowed Tools */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Permitted Tools Whitelist
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(activePolicy.allowed_tools || []).map((tool: string) => (
                  <span
                    key={tool}
                    className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-xs border border-emerald-950"
                  >
                    {tool}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newAllowedTool}
                  onChange={(e) => setNewAllowedTool(e.target.value)}
                  placeholder="Add tool to whitelist (e.g. data_analytics_tool)..."
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white flex-1 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  onClick={handleAddTool}
                  className="px-2.5 py-1 text-xs rounded bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Data Scope */}
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[11px] block mb-1.5">
                Authorized Data Scope Boundaries
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(activePolicy.data_scope || []).map((ds: string) => (
                  <span
                    key={ds}
                    className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs border border-cyan-950"
                  >
                    {ds}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newScopeItem}
                  onChange={(e) => setNewScopeItem(e.target.value)}
                  placeholder="Grant legitimate scope (Scenario F) e.g. financial_reports..."
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white flex-1 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  onClick={handleAddDataScope}
                  className="px-2.5 py-1 text-xs rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Grant
                </button>
              </div>
            </div>

            {/* Restricted Tools & Actions */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <div>
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                  Categorically Restricted Tools (Hard Deny)
                </span>
                <div className="flex flex-wrap gap-1">
                  {(activePolicy.restricted_tools || []).map((rt: string) => (
                    <span
                      key={rt}
                      className="px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-300 font-mono text-[11px] border border-rose-900/60"
                    >
                      {rt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active Bound Task Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Active Task Scope Context
                </h3>
                <span className="text-xs text-slate-400">
                  Task ID: <strong className="text-indigo-300 font-mono">{activeTask?.task_id || "Unassigned"}</strong>
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 text-[11px] border border-indigo-800/40 font-mono">
                {activeTask?.status || "active"}
              </span>
            </div>

            {activeTask ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Task Title:</span>
                  <strong className="text-white text-sm">{activeTask.title}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block">Description & Intent:</span>
                  <p className="text-slate-300 leading-relaxed mt-0.5">{activeTask.description}</p>
                </div>

                <div>
                  <span className="text-slate-500 block">Authorized Task Scope:</span>
                  <div className="flex flex-wrap gap-1 mt-1 font-mono">
                    {(activeTask.authorized_scope || []).map((scope: string) => (
                      <span key={scope} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block">Approved Task Destinations:</span>
                  <div className="flex flex-wrap gap-1 mt-1 font-mono">
                    {(activeTask.approved_destinations || []).map((dest: string) => (
                      <span key={dest} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {dest}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block">Maximum Data Volume Ceiling:</span>
                  <span className="font-mono text-cyan-400 font-bold">{activeTask.max_data_volume} items</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Operations requesting volume higher than this ceiling are held for human signoff.
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs py-10 text-center">No active task bound to this agent.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
