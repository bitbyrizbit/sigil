"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import OverviewPanel from "../components/OverviewPanel";
import AgentInventory from "../components/AgentInventory";
import LiveActivity from "../components/LiveActivity";
import DriftAlerts from "../components/DriftAlerts";
import IncidentTimeline from "../components/IncidentTimeline";
import PolicyManagement from "../components/PolicyManagement";
import EnforcementControls from "../components/EnforcementControls";
import EvaluationPanel from "../components/EvaluationPanel";
import SimulateModal from "../components/SimulateModal";
import {
  fetchSummary,
  fetchAgents,
  fetchEvents,
  fetchAlerts,
  fetchTimeline,
  fetchPolicies,
  fetchApprovals,
  fetchEvaluationMetrics,
  runScenarios,
  runEvaluation,
  seedRegistry,
  updateContainment,
  resolveAlert,
  resolveApproval,
  updatePolicy,
} from "../lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);

  // Live state
  const [summaryData, setSummaryData] = useState({
    summary: { registered_agents: 0, open_alerts: 0, blocked_actions: 0, pending_reviews: 0 },
    recent_events: [],
  });
  const [agents, setAgents] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [policiesData, setPoliciesData] = useState<{ policies: any[]; active_tasks: any[] }>({
    policies: [],
    active_tasks: [],
  });
  const [approvals, setApprovals] = useState<any[]>([]);
  const [evaluationData, setEvaluationData] = useState<any | null>(null);

  const loadAllData = async () => {
    try {
      const [sum, ag, ev, al, tl, pol, app, evl] = await Promise.all([
        fetchSummary().catch(() => ({ summary: { registered_agents: 0, open_alerts: 0, blocked_actions: 0, pending_reviews: 0 }, recent_events: [] })),
        fetchAgents().catch(() => []),
        fetchEvents().catch(() => []),
        fetchAlerts().catch(() => []),
        fetchTimeline().catch(() => []),
        fetchPolicies().catch(() => ({ policies: [], active_tasks: [] })),
        fetchApprovals().catch(() => []),
        fetchEvaluationMetrics().catch(() => null),
      ]);

      setSummaryData(sum);
      setAgents(ag);
      setEvents(ev);
      setAlerts(al);
      setTimeline(tl);
      setPoliciesData(pol);
      setApprovals(app);
      setEvaluationData(evl);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRunScenarios = async () => {
    setLoading(true);
    try {
      await runScenarios();
      await loadAllData();
      setActiveTab("activity");
    } catch (err) {
      console.error("Scenario execution error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBenchmark = async () => {
    setLoading(true);
    try {
      const res = await runEvaluation();
      setEvaluationData(res);
      await loadAllData();
    } catch (err) {
      console.error("Benchmark execution error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSeed = async () => {
    setLoading(true);
    try {
      await seedRegistry();
      await loadAllData();
    } catch (err) {
      console.error("Reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContainment = async (agentId: string, action: string, reason?: string) => {
    try {
      await updateContainment(agentId, action, reason);
      await loadAllData();
    } catch (err) {
      console.error("Containment error:", err);
    }
  };

  const handleResolveAlert = async (alertId: string, status: string) => {
    try {
      await resolveAlert(alertId, status);
      await loadAllData();
    } catch (err) {
      console.error("Alert resolution error:", err);
    }
  };

  const handleResolveApproval = async (approvalId: string, action: "APPROVE" | "REJECT", justification?: string) => {
    try {
      await resolveApproval(approvalId, action, justification);
      await loadAllData();
    } catch (err) {
      console.error("Approval resolution error:", err);
    }
  };

  const handleUpdatePolicy = async (payload: any) => {
    try {
      await updatePolicy(payload);
      await loadAllData();
    } catch (err) {
      console.error("Policy update error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSimulate={() => setIsSimulateOpen(true)}
        onRunScenarios={handleRunScenarios}
        onResetSeed={handleResetSeed}
        loading={loading}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && (
          <OverviewPanel
            summary={summaryData.summary}
            recentEvents={summaryData.recent_events}
            setActiveTab={setActiveTab}
            onOpenSimulate={() => setIsSimulateOpen(true)}
            onRunScenarios={handleRunScenarios}
          />
        )}

        {activeTab === "agents" && (
          <AgentInventory
            agents={agents}
            onUpdateStatus={handleUpdateContainment}
          />
        )}

        {activeTab === "activity" && (
          <LiveActivity events={events} />
        )}

        {activeTab === "alerts" && (
          <DriftAlerts
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
          />
        )}

        {activeTab === "timeline" && (
          <IncidentTimeline timeline={timeline} />
        )}

        {activeTab === "policies" && (
          <PolicyManagement
            policiesData={policiesData}
            onUpdatePolicy={handleUpdatePolicy}
          />
        )}

        {activeTab === "enforcement" && (
          <EnforcementControls
            agents={agents}
            approvals={approvals}
            onUpdateStatus={handleUpdateContainment}
            onResolveApproval={handleResolveApproval}
          />
        )}

        {activeTab === "evaluation" && (
          <EvaluationPanel
            evaluationData={evaluationData}
            onRunBenchmark={handleRunBenchmark}
            loading={loading}
          />
        )}
      </main>

      <SimulateModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onEventCreated={loadAllData}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          Sigil • Runtime Identity Drift Detection and Response for Autonomous AI Agents • github.com/bitbyrizbit/sigil
        </div>
      </footer>
    </div>
  );
}
