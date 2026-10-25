"use client";

import React, { useState } from "react";
import { Shield, Users, Activity, AlertTriangle, GitFork, BookOpen, Lock, BarChart3, Play, RefreshCw, Send, Key, Globe } from "lucide-react";
import { getClientOperatorKey, setClientOperatorKey, getCustomBackendUrl, setCustomBackendUrl, getApiBase } from "../lib/api";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSimulate: () => void;
  onRunScenarios: () => void;
  onResetSeed: () => void;
  loading: boolean;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenSimulate,
  onRunScenarios,
  onResetSeed,
  loading,
}: NavbarProps) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [opKey, setOpKey] = useState(getClientOperatorKey());
  const [backendUrl, setBackendUrl] = useState(() => {
    const custom = getCustomBackendUrl();
    if (custom) return custom;
    const base = getApiBase();
    return base && base !== "http://127.0.0.1:8000" ? base : "";
  });

  const handleSaveKey = () => {
    setClientOperatorKey(opKey);
    setCustomBackendUrl(backendUrl);
    setShowKeyModal(false);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: Shield },
    { id: "agents", label: "Agent inventory", icon: Users },
    { id: "activity", label: "Live activity", icon: Activity },
    { id: "alerts", label: "Drift alerts", icon: AlertTriangle },
    { id: "timeline", label: "Incident timeline", icon: GitFork },
    { id: "policies", label: "Policy management", icon: BookOpen },
    { id: "enforcement", label: "Enforcement controls", icon: Lock },
    { id: "evaluation", label: "Evaluation panel", icon: BarChart3 },
  ];

  return (
    <div className="w-full pt-4 pb-2">
      {/* Top Header Area: Sigil on the left, Tagline & action buttons beside it in one horizontal line */}
      <div className="w-full pb-6 border-b border-ink/15 flex flex-col md:flex-row md:items-center justify-start gap-6 md:gap-10">
        {/* Sigil moved to the left, slanted & tilted (-rotate-6), lowered slightly for horizontal balance */}
        <div className="flex-shrink-0 pt-3 md:pt-4 pl-1 sm:pl-2">
          <div
            className="group inline-flex items-baseline cursor-pointer select-none"
            onClick={() => setActiveTab("overview")}
            title="Sigil home"
          >
            <span className="font-serif italic font-bold text-6xl sm:text-7xl md:text-8xl text-pinkPrimary tracking-tight lowercase inline-block transform -rotate-6 origin-bottom-left transition-colors">
              sigil
              <span className="inline-block font-serif font-bold italic ml-0.5">
                <span className="dot-1 inline-block">.</span>
                <span className="dot-2 inline-block">.</span>
                <span className="dot-3 inline-block">.</span>
              </span>
            </span>
          </div>
        </div>

        {/* Beside sigil: Increased font size tagline, with action buttons placed directly below it */}
        <div className="flex flex-col items-start justify-center space-y-3 pt-2 md:pt-3">
          <p className="text-sm sm:text-base md:text-lg font-sans text-ink font-medium tracking-normal leading-relaxed max-w-2xl">
            Identity drift detection and response layer for autonomous agents
          </p>

          {/* Action Controls: Pill-shaped buttons beside sigil */}
          <div className="flex items-center justify-start gap-2.5 flex-wrap">
            <button
              onClick={onOpenSimulate}
              className="inline-flex items-center px-4 py-2 text-xs font-sans font-medium rounded-full bg-paper text-ink border-1.5 border-ink/80 shadow-ink-sm hover:shadow-ink hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
              style={{ borderWidth: "1.5px" }}
            >
              <Send className="w-3.5 h-3.5 mr-1.5 text-pinkPrimary stroke-[2]" />
              Test an action
            </button>

            <button
              onClick={onRunScenarios}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-xs font-sans font-bold rounded-full bg-pinkPrimary text-white border-1.5 border-ink shadow-pink hover:bg-fuchsia hover:shadow-pink-lg hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50"
              style={{ borderWidth: "1.5px" }}
            >
              <Play className="w-3.5 h-3.5 mr-1.5 fill-white stroke-[2]" />
              Run scenarios
            </button>

            <button
              onClick={() => setShowKeyModal(true)}
              className="inline-flex items-center px-3.5 py-2 text-xs font-sans rounded-full bg-paper text-ink border-1.5 border-ink/80 shadow-ink-sm hover:shadow-ink hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
              style={{ borderWidth: "1.5px" }}
              title="Operator authentication key"
            >
              <Key className="w-3.5 h-3.5 mr-1.5 text-inkMuted stroke-[2]" />
              Operator key
            </button>

            <button
              onClick={onResetSeed}
              disabled={loading}
              className="inline-flex items-center p-2 rounded-full bg-paper text-ink border-1.5 border-ink/80 shadow-ink-sm hover:shadow-ink hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
              style={{ borderWidth: "1.5px" }}
              title="Reset demo data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-ink stroke-[2] ${loading ? "animate-spin text-pinkPrimary" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Segmented Pill Tabs Navigation (Seamless on page, left-aligned) */}
      <nav className="flex items-center justify-start space-x-2 overflow-x-auto py-4 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-pinkPrimary text-white font-bold border-pinkPrimary shadow-pink"
                  : "bg-paper/80 text-ink/80 border-ink/20 hover:border-ink/50 hover:bg-paper font-medium"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 stroke-[2] ${isActive ? "text-white" : "text-inkMuted"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Operator Key & Connection Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="bg-paper border-1.5 border-ink rounded-3xl max-w-md w-full p-6 space-y-4 shadow-pink-lg" style={{ borderWidth: "1.5px" }}>
            <div className="flex items-center justify-between border-b border-ink/15 pb-2.5">
              <h3 className="text-sm font-serif font-bold text-ink flex items-center gap-2">
                <Key className="w-4 h-4 text-pinkPrimary stroke-[2]" />
                Operator authentication &amp; connection
              </h3>
              <span className="text-[10px] font-sans border border-ink/30 px-2.5 py-0.5 rounded-full bg-canvas text-inkMuted font-medium">
                Protected
              </span>
            </div>

            <p className="text-xs text-inkMuted leading-relaxed font-sans">
              Mutations (approvals, pauses, isolations, policy updates, scenario benchmarks) require an operator secret key.
            </p>

            <div className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-inkMuted mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-pinkPrimary" /> Operator secret key
                </label>
                <input
                  type="password"
                  value={opKey}
                  onChange={(e) => setOpKey(e.target.value)}
                  placeholder="Paste operator secret key..."
                  className="w-full bg-canvas border border-ink/40 rounded-full px-4 py-2 text-xs text-ink focus:outline-none focus:border-pinkPrimary focus:bg-paper"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-inkMuted mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-pinkPrimary" /> Backend API URL (Render / Cloud)
                </label>
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="e.g. https://sigil-backend.onrender.com"
                  className="w-full bg-canvas border border-ink/40 rounded-full px-4 py-2 text-xs text-ink focus:outline-none focus:border-pinkPrimary focus:bg-paper"
                />
                <span className="text-[10px] text-inkMuted block mt-1 pl-1">
                  Leave blank to use default backend or environment variable.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 font-sans">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-1.5 rounded-full bg-canvas border border-ink/30 text-xs font-medium text-ink hover:bg-paper transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="px-4 py-1.5 rounded-full bg-pinkPrimary text-white text-xs font-bold hover:bg-fuchsia shadow-sm transition-colors"
              >
                Save &amp; connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
