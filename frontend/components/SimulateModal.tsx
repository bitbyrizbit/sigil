"use client";

import React, { useState } from "react";
import { X, Send, Sparkles, CheckCircle2, XCircle, AlertCircle, Shield } from "lucide-react";
import { executeGateway } from "../lib/api";

interface SimulateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

export default function SimulateModal({ isOpen, onClose, onEventCreated }: SimulateModalProps) {
  const [agentId, setAgentId] = useState("agent_research_01");
  const [toolName, setToolName] = useState("approved_document_reader");
  const [operationType, setOperationType] = useState("read");
  const [targetResource, setTargetResource] = useState("approved_internal_research_documents/quantum_lattice_01.pdf");
  const [dataVolume, setDataVolume] = useState(1);
  const [destination, setDestination] = useState("internal_notes_system");
  const [hasUntrustedProvenance, setHasUntrustedProvenance] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePreset = (preset: string) => {
    setError(null);
    setResult(null);
    if (preset === "normal_research") {
      setAgentId("agent_research_01");
      setToolName("approved_document_reader");
      setOperationType("read");
      setTargetResource("approved_internal_research_documents/quantum_lattice_01.pdf");
      setDataVolume(2);
      setDestination("internal_notes_system");
      setHasUntrustedProvenance(false);
    } else if (preset === "scenario_a_payroll") {
      setAgentId("agent_research_01");
      setToolName("web_search");
      setOperationType("read");
      setTargetResource("payroll_database/executive_salaries.csv");
      setDataVolume(1);
      setDestination("");
      setHasUntrustedProvenance(false);
    } else if (preset === "scenario_b_injection") {
      setAgentId("agent_research_01");
      setToolName("web_search");
      setOperationType("export");
      setTargetResource("approved_internal_research_documents/confidential_project_sigil.doc");
      setDataVolume(15);
      setDestination("https://pastebin.com/raw/exfil_drop");
      setHasUntrustedProvenance(true);
    } else if (preset === "scenario_hold_refund") {
      setAgentId("agent_support_01");
      setToolName("refund_processor");
      setOperationType("issue_refund");
      setTargetResource("order_history/ticket_9918");
      setDataVolume(1);
      setDestination("support_ticket_system");
      setHasUntrustedProvenance(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: any = {
        agent_id: agentId,
        tool_name: toolName,
        operation_type: operationType,
        target_resource: targetResource,
        data_volume: Number(dataVolume),
        destination: destination || null,
        initiating_user: "interactive_console_user",
      };

      if (hasUntrustedProvenance) {
        payload.input_provenance = {
          source: "untrusted_web_crawler",
          trust_level: "untrusted",
          contains_instruction_override: true,
          injection_indicators: ["OVERRIDE_DIRECTIVE", "EXTERNAL_TRANSFER_INSTRUCTION"],
        };
      }

      if (agentId === "agent_support_01" && toolName === "refund_processor") {
        payload.action_parameters = { amount: 220.0 };
      }

      const resp = await executeGateway(payload);
      setResult(resp);
      onEventCreated();
    } catch (err: any) {
      setError(err.message || "Failed to execute through gateway");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Live Tool Gateway Interceptor</h3>
            <p className="text-xs text-slate-400">Dispatch an action through Sigil&apos;s runtime security gateway</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-3 pt-3 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Quick Scenario Presets:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => handlePreset("normal_research")}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-medium border border-emerald-900/60"
            >
              Normal Research Read (Allow)
            </button>
            <button
              type="button"
              onClick={() => handlePreset("scenario_a_payroll")}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 font-medium border border-rose-900/60"
            >
              Scenario A: Out-of-Role Payroll (Block)
            </button>
            <button
              type="button"
              onClick={() => handlePreset("scenario_b_injection")}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium border border-amber-900/60"
            >
              Scenario B: Untrusted Injection Exfil (Block)
            </button>
            <button
              type="button"
              onClick={() => handlePreset("scenario_hold_refund")}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium border border-indigo-900/60"
            >
              Hold-for-Approval: $220 Refund (Hold)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Agent Identity</label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="agent_research_01">Research Agent (agent_research_01)</option>
                <option value="agent_finance_01">Finance Agent (agent_finance_01)</option>
                <option value="agent_support_01">Customer Support Agent (agent_support_01)</option>
                <option value="agent_brand_new_01">Brand New Cold-Start Agent (unregistered)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Tool Name</label>
              <input
                type="text"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Operation Type</label>
              <input
                type="text"
                value={operationType}
                onChange={(e) => setOperationType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Data Volume</label>
              <input
                type="number"
                value={dataVolume}
                onChange={(e) => setDataVolume(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Target Resource</label>
            <input
              type="text"
              value={targetResource}
              onChange={(e) => setTargetResource(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Destination Target (Optional)</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. internal_notes_system or https://pastebin.com/exfil"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="injection_toggle"
              checked={hasUntrustedProvenance}
              onChange={(e) => setHasUntrustedProvenance(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-0"
            />
            <label htmlFor="injection_toggle" className="text-slate-300 font-sans cursor-pointer">
              Simulate Untrusted Upstream Input Provenance (Indirect Prompt Injection Vector)
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? "Evaluating..." : "Send to Gateway"}
            </button>
          </div>
        </form>

        {/* Live Execution Result Banner */}
        {result && (
          <div className="mt-5 p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-sans font-bold text-white flex items-center gap-2">
                {result.decision === "BLOCK" ? (
                  <XCircle className="w-4 h-4 text-rose-400" />
                ) : result.decision === "HOLD_FOR_APPROVAL" ? (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                Gateway Response: <span className="font-extrabold text-cyan-300">{result.decision}</span>
              </span>
              <span className="text-slate-400 font-normal">
                Risk Score: <strong className="text-rose-400 font-bold">{result.risk_score}/100</strong>
              </span>
            </div>

            <p className="text-slate-200 font-sans text-xs leading-relaxed">{result.explanation}</p>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
              <div>Execution Status: <strong className="text-white">{result.execution_status}</strong></div>
              <div>Confidence: <strong className="text-cyan-400">{Math.round(result.confidence * 100)}%</strong></div>
            </div>

            {result.tool_output && (
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-emerald-400 uppercase font-sans font-bold block mb-1">
                  Protected Tool Execution Output (Outside Agent):
                </span>
                <pre className="text-slate-300 text-[11px] overflow-x-auto">
                  {JSON.stringify(result.tool_output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
