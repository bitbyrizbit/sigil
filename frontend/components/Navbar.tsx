"use client";

import React, { useState } from "react";
import { Shield, Users, Activity, AlertTriangle, GitFork, BookOpen, Lock, BarChart3, Play, RefreshCw, Send, Key } from "lucide-react";
import { getClientOperatorKey, setClientOperatorKey } from "../lib/api";

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

  const handleSaveKey = () => {
    setClientOperatorKey(opKey);
    setShowKeyModal(false);
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
      {/* Top Header Area */}
      <div className="w-full pb-6 border-b border-ink/15">
        {/* Sigil moved to the left (where lower cards begin), more slanted & tilted (-rotate-6), slow staggered sequential dots on hover */}
        <div className="w-full flex items-start justify-start pl-1 sm:pl-2 pt-2">
          <div
            className="group inline-flex items-baseline cursor-pointer select-none"
            onClick={() => setActiveTab("overview")}
            title="Sigil home"
          >
            <span className="font-serif italic font-bold text-7xl sm:text-8xl md:text-9xl text-pinkPrimary tracking-tight lowercase inline-block transform -rotate-6 origin-bottom-left transition-colors">
              sigil
              <span className="inline-block font-serif font-bold italic ml-0.5">
                <span className="dot-1 inline-block">.</span>
                <span className="dot-2 inline-block">.</span>
                <span className="dot-3 inline-block">.</span>
              </span>
            </span>
          </div>
        </div>

        {/* Identity drift line: stays centered, with increased gap and increased line-spacing */}
        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-xs sm:text-sm font-sans text-inkMuted tracking-wide leading-relaxed max-w-xl mx-auto">
            Identity drift detection and response layer for autonomous agents
          </p>

          {/* Action Controls: Pill-shaped, tactile, centered row */}
          <div className="flex items-center justify-center gap-2.5 flex-wrap mt-5">
            <button
              onClick={onOpenSimulate}
              className="inline-flex items-center px-4 py-2 text-xs font-sans font-medium rounded-full bg-paper text-ink border-1.5 border-ink/80 shadow-ink-sm hover:shadow-ink hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
              style={{ borderWidth: "1.5px" }}
            >
              <Send className="w-3.5 h-3.5 mr-1.5 text-pinkPrimary stroke-[2]" />
              Gateway simulator
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
              title="Reset baseline registry"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-ink stroke-[2] ${loading ? "animate-spin text-pinkPrimary" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Segmented Pill Tabs Navigation (Seamless on page, centered) */}
      <nav className="flex items-center justify-start md:justify-center space-x-2 overflow-x-auto py-4 scrollbar-none">
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

      {/* Operator Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="bg-paper border-1.5 border-ink rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-pink-lg" style={{ borderWidth: "1.5px" }}>
            <div className="flex items-center justify-between border-b border-ink/15 pb-2.5">
              <h3 className="text-sm font-serif font-bold text-ink flex items-center gap-2">
                <Key className="w-4 h-4 text-pinkPrimary stroke-[2]" />
                Operator authentication
              </h3>
              <span className="text-[10px] font-sans border border-ink/30 px-2.5 py-0.5 rounded-full bg-canvas text-inkMuted font-medium">
                Protected
              </span>
            </div>
            <p className="text-xs text-inkMuted leading-relaxed font-sans">
              Mutations (approvals, pauses, isolations, policy updates, scenario benchmarks) require an operator secret. Observers browse in read-only mode.
            </p>
            <input
              type="password"
              value={opKey}
              onChange={(e) => setOpKey(e.target.value)}
              placeholder="Paste operator secret key..."
              className="w-full bg-canvas border border-ink/40 rounded-full px-4 py-2 text-xs text-ink focus:outline-none focus:border-pinkPrimary focus:bg-paper font-sans"
            />
            <div className="flex justify-end gap-2 pt-1 font-sans">
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
                Save key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
