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
  const [pageScrollProgress, setPageScrollProgress] = useState(0);

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

  // Track vertical page scroll and translate it into horizontal progress at the top
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setPageScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-pinkPrimary selection:text-white relative">
      {/* Horizontal Page Scroll Track on the Top: Translates vertical page scrolling into horizontal top indicator */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-ink/10 z-50 pointer-events-none">
        <div
          className="h-full bg-pinkPrimary transition-[width] duration-100 ease-out shadow-sm"
          style={{ width: `${pageScrollProgress}%` }}
        />
      </div>

      {/* Padded Container: Prevents any element from sticking to the screen walls */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-6 md:py-8 flex flex-col flex-1">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSimulate={() => setIsSimulateOpen(true)}
          onRunScenarios={handleRunScenarios}
          onResetSeed={handleResetSeed}
          loading={loading}
        />

        <main className="flex-1 w-full py-6">
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

        {/* Seamless Blended Footer: Increased font sizes for all elements */}
        <footer className="pt-16 pb-8 mt-auto w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 font-sans">
            <div className="flex items-center gap-3.5">
              <div
                className="group inline-flex items-baseline cursor-pointer select-none"
                onClick={() => setActiveTab("overview")}
                title="Sigil home"
              >
                <span className="font-serif italic font-bold text-3xl sm:text-4xl text-pinkPrimary lowercase inline-block transform -rotate-6 transition-colors">
                  sigil
                  <span className="inline-block font-serif font-bold italic ml-0.5">
                    <span className="dot-1 inline-block">.</span>
                    <span className="dot-2 inline-block">.</span>
                    <span className="dot-3 inline-block">.</span>
                  </span>
                </span>
              </div>
              <span className="text-ink/30 text-base">•</span>
              <span className="text-ink text-sm sm:text-base font-semibold">Runtime identity drift proxy</span>
            </div>

            <div className="italic font-serif text-pinkPrimary text-base sm:text-xl font-bold">
              “Authenticated isn’t innocent.”
            </div>

            <div className="text-xs sm:text-sm font-semibold text-inkMuted">
              Out-of-agent execution boundary
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
