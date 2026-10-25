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
    { id: "agents", label: "1. Agent Inventory", icon: Users },
    { id: "activity", label: "2. Live Activity", icon: Activity },
    { id: "alerts", label: "3. Drift Alerts", icon: AlertTriangle },
    { id: "timeline", label: "4. Incident Timeline", icon: GitFork },
    { id: "policies", label: "5. Policy Management", icon: BookOpen },
    { id: "enforcement", label: "6. Enforcement Controls", icon: Lock },
    { id: "evaluation", label: "7. Evaluation Panel", icon: BarChart3 },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("overview")}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">Sigil</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  Runtime Security Layer
                </span>
              </div>
              <p className="text-xs text-slate-400 -mt-0.5">Identity Drift Detection & Response for AI Agents</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSimulate}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30 transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Gateway Simulator
            </button>
            <button
              onClick={onRunScenarios}
              disabled={loading}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30 transition shadow-sm disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              Run All Scenarios
            </button>
            <button
              onClick={() => setShowKeyModal(true)}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Operator Authentication Key"
            >
              <Key className="w-3.5 h-3.5 mr-1 text-amber-400" />
              Operator Key
            </button>
            <button
              onClick={onResetSeed}
              disabled={loading}
              className="inline-flex items-center p-1.5 text-xs font-medium rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Reset & Seed Baseline Registry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-400" />
              Operator Security Authentication
            </h3>
            <p className="text-xs text-slate-400">
              Control actions (Approve, Deny, Isolate, Policy Edit, Seed) require an operator key. Visitors without the key have read-only access.
            </p>
            <input
              type="password"
              value={opKey}
              onChange={(e) => setOpKey(e.target.value)}
              placeholder="Enter operator key..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-bold"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
