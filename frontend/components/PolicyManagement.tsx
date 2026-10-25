"use client";

import React, { useState } from "react";
import { BookOpen, Plus, Shield, Sliders } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink/15 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-pinkPrimary stroke-[2]" />
            Policy &amp; scope management
          </h2>
          <p className="text-xs text-inkMuted font-sans mt-0.5">
            Administer enforceable role boundaries, tool whitelists, and immutable policy revisions (Scenario F)
          </p>
        </div>
      </div>

      {/* Select Agent Tabs: Rounded-full pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 font-sans text-xs">
        {policiesData.policies.map((p) => (
          <button
            key={p.agent_id}
            onClick={() => setSelectedAgentId(p.agent_id)}
            className={`px-4 py-1.5 rounded-full border transition-all ${
              selectedAgentId === p.agent_id
                ? "bg-pinkPrimary text-white font-bold border-pinkPrimary shadow-pink"
                : "bg-paper text-ink border-ink/20 hover:border-ink/50"
            }`}
          >
            {p.name} ({p.agent_id})
          </button>
        ))}
      </div>

      {activePolicy && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Policy Profile Card */}
          <div className="p-7 bg-paper border-1.5 border-ink/80 rounded-3xl shadow-ink space-y-5" style={{ borderWidth: "1.5px" }}>
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-ink flex items-center gap-2">
                  <Shield className="w-4 h-4 text-pinkPrimary stroke-[2]" />
                  Policy rules: {activePolicy.name}
                </h3>
                <span className="text-xs text-inkMuted font-sans">
                  Enforceable version: <strong className="text-pinkPrimary font-num tabular-nums font-bold">v{activePolicy.policy_version}</strong>
                </span>
              </div>
            </div>

            {/* Allowed Tools */}
            <div className="space-y-2 font-sans">
              <span className="text-[11px] font-sans font-bold text-inkMuted block">
                Allowed tools whitelist
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(activePolicy.allowed_tools || []).map((tool: string) => (
                  <span
                    key={tool}
                    className="px-2.5 py-0.5 rounded-full border border-ink/20 bg-canvas text-ink text-xs font-medium"
                  >
                    {tool}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 pt-2 font-sans text-xs">
                <input
                  type="text"
                  value={newAllowedTool}
                  onChange={(e) => setNewAllowedTool(e.target.value)}
                  placeholder="Tool identifier to add..."
                  className="bg-canvas border border-ink/30 rounded-full px-4 py-2 text-xs text-ink flex-1 focus:outline-none focus:border-pinkPrimary focus:bg-paper"
                />
                <button
                  onClick={handleAddTool}
                  className="px-4 py-2 bg-pinkPrimary text-white font-semibold rounded-full hover:bg-fuchsia transition-all shadow-pink flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2]" /> Add tool
                </button>
              </div>
            </div>

            {/* Data Scope */}
            <div className="space-y-2 pt-3 border-t border-ink/10 font-sans">
              <span className="text-[11px] font-sans font-bold text-inkMuted block">
                Authorized data scope boundaries
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(activePolicy.data_scope || []).map((ds: string) => (
                  <span
                    key={ds}
                    className="px-2.5 py-0.5 rounded-full border border-ink/20 bg-canvas text-ink text-xs font-medium"
                  >
                    {ds}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 pt-2 font-sans text-xs">
                <input
                  type="text"
                  value={newScopeItem}
                  onChange={(e) => setNewScopeItem(e.target.value)}
                  placeholder="Grant scope (e.g. vendor_records)..."
                  className="bg-canvas border border-ink/30 rounded-full px-4 py-2 text-xs text-ink flex-1 focus:outline-none focus:border-pinkPrimary focus:bg-paper"
                />
                <button
                  onClick={handleAddDataScope}
                  className="px-4 py-2 bg-paper border-1.5 border-ink text-ink font-semibold rounded-full hover:bg-hold transition-all shadow-ink-sm flex items-center gap-1.5"
                  style={{ borderWidth: "1.5px" }}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2]" /> Amend scope
                </button>
              </div>
            </div>

            {/* Restricted Tools & Actions */}
            <div className="pt-3 border-t border-ink/10 space-y-2 font-sans">
              <span className="text-[11px] font-sans font-bold text-fuchsia block">
                Categorically restricted tools (hard gateway deny)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(activePolicy.restricted_tools || []).map((rt: string) => (
                  <span
                    key={rt}
                    className="px-2.5 py-0.5 rounded-full border border-fuchsia/40 bg-paper text-fuchsia font-semibold text-xs"
                  >
                    {rt}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Active Bound Task Card */}
          <div className="p-7 bg-paper border-1.5 border-ink/80 rounded-3xl shadow-ink space-y-4 font-sans" style={{ borderWidth: "1.5px" }}>
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-ink flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-pinkPrimary stroke-[2]" />
                  Active task scope context
                </h3>
                <span className="text-xs text-inkMuted">
                  Task ID: <strong className="text-ink">{activeTask?.task_id || "Unassigned"}</strong>
                </span>
              </div>
              <span className="px-3 py-0.5 rounded-full border border-ink/30 bg-canvas text-ink text-[11px] font-semibold">
                {activeTask?.status || "active"}
              </span>
            </div>

            {activeTask ? (
              <div className="space-y-3.5 text-xs text-ink font-sans">
                <div>
                  <span className="text-inkMuted block text-[11px] font-semibold">Task title:</span>
                  <strong className="text-ink font-serif font-bold text-sm">{activeTask.title}</strong>
                </div>

                <div>
                  <span className="text-inkMuted block text-[11px] font-semibold">Intent &amp; mandate:</span>
                  <p className="text-ink leading-relaxed mt-0.5">{activeTask.description}</p>
                </div>

                <div>
                  <span className="text-inkMuted block text-[11px] font-semibold">Authorized task scope:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(activeTask.authorized_scope || []).map((scope: string) => (
                      <span key={scope} className="px-2.5 py-0.5 rounded-full border border-ink/20 bg-canvas text-ink text-xs">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-inkMuted block text-[11px] font-semibold">Approved task destinations:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(activeTask.approved_destinations || []).map((dest: string) => (
                      <span key={dest} className="px-2.5 py-0.5 rounded-full border border-ink/20 bg-canvas text-ink text-xs">
                        {dest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-ink/10">
                  <span className="text-inkMuted block text-[11px] font-semibold">Volume ceiling:</span>
                  <span className="font-num font-bold text-sm tabular-nums text-pinkPrimary">{activeTask.max_data_volume} items</span>
                  <span className="text-inkMuted text-[11px] block mt-0.5">
                    Any single invocation exceeding this ceiling is automatically routed to an approval hold.
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-inkMuted text-xs py-12 text-center">No active task bound to this agent identity.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
