"use client";

import React, { useState } from "react";
import { Send, Shield, ArrowLeft } from "lucide-react";
import { executeGateway } from "../lib/api";
import { DecisionStamp } from "./Stamp";

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
  const [selectedPreset, setSelectedPreset] = useState<string>("normal_research");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePreset = (preset: string) => {
    setSelectedPreset(preset);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-ink/60 backdrop-blur-xs">
      <div
        className="bg-paper border-1.5 border-ink/80 rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-pink-lg relative font-sans my-auto flex flex-col overflow-hidden"
        style={{ borderWidth: "1.5px" }}
      >
        {/* Modal Header: Pinned at top with intact rounded corners */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-ink/10 flex-shrink-0 bg-paper">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-pinkPrimary/10 border border-pinkPrimary/30 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-pinkPrimary stroke-[2]" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-ink">Test AI Agent Action</h3>
              <p className="text-xs text-inkMuted font-sans">Dispatch arbitrary tool calls through the live Sigil mediation proxy</p>
            </div>
          </div>

          {/* Back button in place of close button */}
          <div className="flex items-center flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full border border-ink/20 bg-canvas text-inkMuted hover:text-ink hover:border-ink/50 transition-all flex items-center gap-1.5 text-xs font-sans font-medium"
              title="Go back"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2]" />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body: Contained within card so scrollbar never cuts outer rounded corners */}
        <div className="p-6 pt-5 overflow-y-auto flex-1 overscroll-contain">
          {/* Quick Presets */}
          <div className="pt-1">
          <span className="text-[11px] font-sans font-bold text-inkMuted block mb-2">
            Scenario presets:
          </span>
          <div className="flex flex-wrap gap-2 text-xs font-sans">
            <button
              type="button"
              onClick={() => handlePreset("normal_research")}
              className={`px-3.5 py-1.5 rounded-full border text-xs whitespace-nowrap transition-all ${
                selectedPreset === "normal_research"
                  ? "bg-pinkPrimary text-white font-bold border-pinkPrimary shadow-pink"
                  : "bg-canvas text-ink border-ink/20 hover:border-ink/50 font-medium"
              }`}
            >
              Standard research task (Allow)
            </button>
            <button
              type="button"
              onClick={() => handlePreset("scenario_a_payroll")}
              className={`px-3.5 py-1.5 rounded-full border text-xs whitespace-nowrap transition-all ${
                selectedPreset === "scenario_a_payroll"
                  ? "bg-pinkPrimary text-white font-bold border-pinkPrimary shadow-pink"
                  : "bg-canvas text-ink border-ink/20 hover:border-ink/50 font-medium"
              }`}
            >
              Payroll access (Block)
            </button>
            <button
              type="button"
              onClick={() => handlePreset("scenario_b_injection")}
              className={`px-3.5 py-1.5 rounded-full border text-xs whitespace-nowrap transition-all ${
                selectedPreset === "scenario_b_injection"
                  ? "bg-pinkPrimary text-white font-bold border-pinkPrimary shadow-pink"
                  : "bg-canvas text-ink border-ink/20 hover:border-ink/50 font-medium"
              }`}
            >
              Prompt injection exfil (Block)
            </button>
            <button
              type="button"
              onClick={() => handlePreset("scenario_hold_refund")}
              className={`px-3.5 py-1.5 rounded-full border text-xs whitespace-nowrap transition-all ${
                selectedPreset === "scenario_hold_refund"
                  ? "bg-pinkPrimary text-white font-bold border-pinkPrimary shadow-pink"
                  : "bg-canvas text-ink border-ink/20 hover:border-ink/50 font-medium"
              }`}
            >
              $220 refund (Hold for review)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-inkMuted font-semibold text-[11px] mb-1">Agent identity</label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full bg-canvas border border-ink/30 rounded-2xl p-2.5 text-ink focus:outline-none focus:border-pinkPrimary focus:bg-paper font-sans text-xs"
              >
                <option value="agent_research_01">Research Agent (agent_research_01)</option>
                <option value="agent_finance_01">Finance Agent (agent_finance_01)</option>
                <option value="agent_support_01">Customer Support Agent (agent_support_01)</option>
                <option value="agent_brand_new_01">Brand New Cold-Start Agent (unregistered)</option>
              </select>
            </div>

            <div>
              <label className="block text-inkMuted font-semibold text-[11px] mb-1">Requested tool name</label>
              <input
                type="text"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className="w-full bg-canvas border border-ink/30 rounded-2xl p-2.5 text-ink focus:outline-none focus:border-pinkPrimary focus:bg-paper font-sans text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-inkMuted font-semibold text-[11px] mb-1">Operation type</label>
              <input
                type="text"
                value={operationType}
                onChange={(e) => setOperationType(e.target.value)}
                className="w-full bg-canvas border border-ink/30 rounded-2xl p-2.5 text-ink focus:outline-none focus:border-pinkPrimary focus:bg-paper font-sans text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-inkMuted font-semibold text-[11px] mb-1">Data volume (items)</label>
              <input
                type="number"
                value={dataVolume}
                onChange={(e) => setDataVolume(parseInt(e.target.value) || 1)}
                className="w-full bg-canvas border border-ink/30 rounded-2xl p-2.5 text-ink focus:outline-none focus:border-pinkPrimary focus:bg-paper font-num tabular-nums text-xs"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-inkMuted font-semibold text-[11px] mb-1">Target resource</label>
            <input
              type="text"
              value={targetResource}
              onChange={(e) => setTargetResource(e.target.value)}
              className="w-full bg-canvas border border-ink/30 rounded-2xl p-2.5 text-ink focus:outline-none focus:border-pinkPrimary focus:bg-paper font-sans text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-inkMuted font-semibold text-[11px] mb-1">Destination target (optional)</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. internal_notes_system or external URL"
              className="w-full bg-canvas border border-ink/30 rounded-2xl p-2.5 text-ink focus:outline-none focus:border-pinkPrimary focus:bg-paper font-sans text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-1 font-sans">
            <input
              type="checkbox"
              id="injection_toggle"
              checked={hasUntrustedProvenance}
              onChange={(e) => setHasUntrustedProvenance(e.target.checked)}
              className="rounded text-pinkPrimary focus:ring-pinkPrimary"
            />
            <label htmlFor="injection_toggle" className="text-ink text-xs cursor-pointer">
              Simulate document with hidden malicious instructions
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2.5 border-t border-ink/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-canvas border border-ink/30 text-ink font-medium hover:bg-paper text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-full bg-pinkPrimary text-white font-bold flex items-center gap-1.5 shadow-pink hover:bg-fuchsia active:translate-x-[1px] active:translate-y-[1px] transition-all disabled:opacity-50 text-xs"
            >
              <Send className="w-3.5 h-3.5 stroke-[2]" />
              {loading ? "Evaluating..." : "Run test"}
            </button>
          </div>
        </form>

        {/* Live Execution Result Banner */}
        {result && (
          <div className="mt-5 p-5 bg-canvas/40 border border-ink/20 rounded-2xl space-y-2.5 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-ink/10 pb-2">
              <span className="font-sans font-bold text-ink flex items-center gap-2">
                Gateway evaluation:
                <DecisionStamp decision={result.decision} size="sm" />
              </span>
              <span className="text-ink font-bold">
                Risk score: <strong className="font-num text-fuchsia tabular-nums">{result.risk_score} / 100</strong>
              </span>
            </div>

            <p className="text-ink text-xs leading-relaxed">{result.explanation}</p>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-inkMuted pt-1.5 border-t border-ink/10">
              <div>Execution state: <strong className="text-ink">{result.execution_status}</strong></div>
              <div>Statistical confidence: <strong className="font-num text-ink tabular-nums">{Math.round(result.confidence * 100)}%</strong></div>
            </div>

            {result.tool_output && (
              <div className="p-3 bg-paper rounded-xl border border-ink/15 mt-2">
                <span className="text-[10px] text-pinkPrimary font-bold block mb-1">
                  Tool execution result payload:
                </span>
                <pre className="text-ink font-num text-[11px] overflow-x-auto">
                  {JSON.stringify(result.tool_output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3.5 bg-fuchsia/10 border border-fuchsia/30 rounded-2xl text-fuchsia text-xs font-semibold">
            {error}
          </div>
        )}
        <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
