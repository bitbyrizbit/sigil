"use client";

import React, { useRef, useState, useEffect } from "react";
import { Users, AlertTriangle, ShieldAlert, Clock, ArrowUpRight, PlayCircle, ChevronsUpDown } from "lucide-react";
import { DecisionStamp } from "./Stamp";

interface OverviewProps {
  summary: {
    registered_agents: number;
    open_alerts: number;
    blocked_actions: number;
    pending_reviews: number;
  };
  recentEvents: any[];
  setActiveTab: (tab: string) => void;
  onOpenSimulate: () => void;
  onRunScenarios: () => void;
}

export default function OverviewPanel({
  summary,
  recentEvents,
  setActiveTab,
  onRunScenarios,
}: OverviewProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollRatio, setScrollRatio] = useState(0);

  const handleTableScroll = () => {
    if (!tableRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tableRef.current;
    const maxScroll = scrollWidth - clientWidth;
    setScrollRatio(maxScroll > 0 ? scrollLeft / maxScroll : 0);
  };

  // Prevent page scroll when vertically scrolling inside the table box
  useEffect(() => {
    const tableEl = tableRef.current;
    if (!tableEl) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault(); // Prevents vertical page scroll completely!
        e.stopPropagation();
        tableEl.scrollLeft += e.deltaY * 0.95;
      }
    };

    tableEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => tableEl.removeEventListener("wheel", handleWheel);
  }, []);

  // Also prevent page scroll when wheeling over the vertical controller track
  useEffect(() => {
    const trackEl = trackRef.current;
    const tableEl = tableRef.current;
    if (!trackEl || !tableEl) return;

    const handleTrackWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        e.stopPropagation();
        tableEl.scrollLeft += e.deltaY * 0.95;
      }
    };

    trackEl.addEventListener("wheel", handleTrackWheel, { passive: false });
    return () => trackEl.removeEventListener("wheel", handleTrackWheel);
  }, []);

  const handleVerticalTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tableRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const ratio = Math.max(0, Math.min(1, clickY / rect.height));
    const maxScroll = tableRef.current.scrollWidth - tableRef.current.clientWidth;
    tableRef.current.scrollLeft = ratio * maxScroll;
  };

  return (
    <div className="space-y-6">
      {/* Editorial Hero Callout */}
      <div
        className="p-7 bg-paper border-1.5 border-ink/80 rounded-3xl shadow-ink relative overflow-hidden"
        style={{ borderWidth: "1.5px" }}
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            <div className="flex items-center space-x-3 flex-wrap gap-y-1">
              <span className="font-sans text-[11px] font-bold px-3 py-1 rounded-full bg-pinkPrimary text-white shadow-sm">
                Runtime mediation
              </span>
              <span className="text-base sm:text-lg font-serif italic text-pinkPrimary font-bold">
                “Agents don’t go rogue. They drift.”
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ink tracking-tight leading-tight">
              Is your agent still itself?
            </h1>

            <p className="text-xs sm:text-sm text-inkMuted leading-relaxed font-sans">
              Traditional authentication answers whether an agent holds a valid API key. Sigil answers whether invoking that tool aligns with its assigned identity, active task intent, and authorized data scope. When an agent drifts, tool calls are blocked at the perimeter before execution.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-3.5 shrink-0">
            <button
              onClick={onRunScenarios}
              className="px-5 py-2.5 text-xs font-sans font-bold rounded-full bg-pinkPrimary text-white border-1.5 border-ink shadow-pink hover:bg-fuchsia hover:shadow-pink-lg hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-2"
              style={{ borderWidth: "1.5px" }}
            >
              <PlayCircle className="w-4 h-4 text-white stroke-[2]" />
              Run 13 test scenarios
            </button>

            <span className="text-sm sm:text-base font-serif italic text-pinkPrimary font-bold pl-1">
              “Badge says research. Hands say payroll.”
            </span>
          </div>
        </div>

        {/* Tactical Indicators */}
        <div className="mt-6 pt-4 border-t border-ink/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
          <div className="flex items-center gap-2 text-ink">
            <span className="w-2.5 h-2.5 rounded-full bg-allow shrink-0" />
            <span>Interceptor: <strong className="font-semibold">Active tool proxy</strong></span>
          </div>
          <div className="flex items-center gap-2 text-ink">
            <span className="w-2.5 h-2.5 rounded-full bg-pinkPrimary shrink-0" />
            <span>Multi-signal model: <strong className="font-semibold">5 corroborating signals</strong></span>
          </div>
          <div className="flex items-center gap-2 text-ink">
            <span className="w-2.5 h-2.5 rounded-full bg-ink shrink-0" />
            <span>Forensic ledger: <strong className="font-semibold">Tamper-proof 9-point store</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div
          onClick={() => setActiveTab("agents")}
          className="p-5 bg-paper border-1.5 border-ink/70 rounded-3xl shadow-ink-sm hover:shadow-ink hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer group"
          style={{ borderWidth: "1.5px" }}
        >
          <div className="flex items-center justify-between border-b border-ink/10 pb-2">
            <span className="text-xs font-sans font-medium text-inkMuted">Registered agents</span>
            <Users className="w-4 h-4 text-inkMuted stroke-[1.5]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-4xl font-num font-bold text-ink tracking-tight tabular-nums">{summary.registered_agents}</span>
            <span className="text-xs font-sans text-pinkPrimary font-bold flex items-center group-hover:underline">
              Inventory <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <p className="text-[11px] text-inkMuted mt-1 font-sans">Research, finance, support</p>
        </div>

        {/* Card 2 */}
        <div
          onClick={() => setActiveTab("alerts")}
          className="p-5 bg-paper border-1.5 border-pinkPrimary rounded-3xl shadow-pink hover:shadow-pink-lg hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer group"
          style={{ borderWidth: "1.5px" }}
        >
          <div className="flex items-center justify-between border-b border-ink/10 pb-2">
            <span className="text-xs font-sans font-bold text-pinkPrimary">Open drift alerts</span>
            <AlertTriangle className="w-4 h-4 text-pinkPrimary stroke-[2]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-4xl font-num font-bold text-pinkPrimary tracking-tight tabular-nums">{summary.open_alerts}</span>
            <span className="text-xs font-sans text-pinkPrimary flex items-center font-bold group-hover:underline">
              Investigate <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <p className="text-[11px] text-inkMuted mt-1 font-sans">Evidence-backed out-of-role alerts</p>
        </div>

        {/* Card 3 */}
        <div
          onClick={() => setActiveTab("activity")}
          className="p-5 bg-paper border-1.5 border-ink/70 rounded-3xl shadow-ink-sm hover:shadow-ink hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer group"
          style={{ borderWidth: "1.5px" }}
        >
          <div className="flex items-center justify-between border-b border-ink/10 pb-2">
            <span className="text-xs font-sans font-medium text-inkMuted">Blocked actions</span>
            <ShieldAlert className="w-4 h-4 text-fuchsia stroke-[1.5]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-4xl font-num font-bold text-fuchsia tracking-tight tabular-nums">{summary.blocked_actions}</span>
            <span className="text-xs font-sans text-ink font-bold flex items-center group-hover:underline">
              Live stream <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <p className="text-[11px] text-inkMuted mt-1 font-sans">Pre-execution gateway stops</p>
        </div>

        {/* Card 4 */}
        <div
          onClick={() => setActiveTab("enforcement")}
          className="p-5 bg-paper border-1.5 border-ink/70 rounded-3xl shadow-ink-sm hover:shadow-ink hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer group"
          style={{ borderWidth: "1.5px" }}
        >
          <div className="flex items-center justify-between border-b border-ink/10 pb-2">
            <span className="text-xs font-sans font-medium text-inkMuted">Pending holds</span>
            <Clock className="w-4 h-4 text-inkMuted stroke-[1.5]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-4xl font-num font-bold text-ink tracking-tight tabular-nums">{summary.pending_reviews}</span>
            <span className="text-xs font-sans text-ink font-bold flex items-center group-hover:underline">
              Review queue <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <p className="text-[11px] text-inkMuted mt-1 font-sans">Queued for human verification</p>
        </div>
      </div>

      {/* Recent Telemetry Interceptions Card with Vertical-to-Horizontal Scroll Logic */}
      <div className="bg-paper border-1.5 border-ink/80 rounded-3xl shadow-ink p-6" style={{ borderWidth: "1.5px" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink/15 pb-3 mb-4">
          <div>
            <h2 className="text-base font-serif font-bold text-ink">Recent tool interceptions</h2>
            <p className="text-xs text-inkMuted font-sans">
              Real-time activity observed and mediated by the Sigil proxy (scroll inside to slide columns; page will not scroll)
            </p>
          </div>
          <button
            onClick={() => setActiveTab("activity")}
            className="text-xs font-sans text-pinkPrimary font-bold hover:underline flex items-center self-start sm:self-center"
          >
            View full stream <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {recentEvents.length === 0 ? (
          <div className="text-center py-10 text-inkMuted text-xs font-sans">
            No events recorded yet. Click &quot;Run 13 test scenarios&quot; or launch the &quot;Gateway simulator&quot; to inspect runtime enforcement.
          </div>
        ) : (
          <div className="flex items-stretch gap-3">
            {/* Horizontal Table Container (native horizontal scrollbar hidden; mouse wheel scrolls it horizontally without scrolling the page) */}
            <div
              ref={tableRef}
              onScroll={handleTableScroll}
              className="flex-1 overflow-x-auto scrollbar-none select-text"
            >
              <table className="w-full text-left text-xs border-collapse font-sans min-w-[850px]">
                <thead className="text-[11px] font-sans font-bold text-inkMuted border-b border-ink/15 bg-canvas/40">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Agent</th>
                    <th className="py-2.5 px-3">Tool &amp; operation</th>
                    <th className="py-2.5 px-3">Target resource</th>
                    <th className="py-2.5 px-3">Risk score</th>
                    <th className="py-2.5 px-3">Decision</th>
                    <th className="py-2.5 px-3">Execution outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10 text-ink">
                  {recentEvents.map((evt) => (
                    <tr key={evt.event_id} className="hover:bg-canvas/30 transition-colors">
                      <td className="py-3 px-3 text-inkMuted font-num text-[11px] tabular-nums whitespace-nowrap">
                        {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : "--:--:--"}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-sans">
                        <span className="font-semibold text-ink block">{evt.agent_name}</span>
                        <span className="text-[11px] text-inkMuted block">{evt.role}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-sans text-[11px] font-semibold bg-canvas px-2.5 py-0.5 rounded-full border border-ink/20">
                          {evt.tool_name}
                        </span>
                        <span className="text-inkMuted text-[11px] ml-1.5 font-sans">({evt.operation_type})</span>
                      </td>
                      <td className="py-3 px-3 text-ink max-w-xs truncate font-sans text-[11px]" title={evt.target_resource}>
                        {evt.target_resource}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-num font-bold tabular-nums">
                        <span className={evt.risk_score >= 70 ? "text-fuchsia font-bold" : "text-ink"}>
                          {evt.risk_score} / 100
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <DecisionStamp decision={evt.decision} size="sm" />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-xs font-sans">
                        {evt.result === "allowed" || evt.result === "succeeded" ? (
                          <span className="text-allow font-semibold">Tool executed</span>
                        ) : evt.result === "pending_approval" ? (
                          <span className="text-ink font-medium bg-hold/30 px-2 py-0.5 rounded-full border border-ink/30">Awaiting operator signoff</span>
                        ) : (
                          <span className="text-fuchsia font-semibold">Pre-execution suppressed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dedicated Vertical Scroll Controller Track Outside the Box */}
            <div ref={trackRef} className="flex flex-col items-center justify-between py-1 px-0.5 shrink-0 select-none">
              <div className="text-[9px] font-sans font-bold text-pinkPrimary tracking-wider uppercase writing-vertical flex items-center gap-1 mb-1">
                <ChevronsUpDown className="w-3 h-3 text-pinkPrimary" />
              </div>

              <div
                onClick={handleVerticalTrackClick}
                className="w-2.5 flex-1 bg-canvas border border-ink/20 rounded-full relative cursor-pointer hover:bg-canvasSubtle transition-colors shadow-inner"
                title="Scroll vertically or click to slide table horizontally"
              >
                <div
                  className="w-full bg-pinkPrimary rounded-full absolute transition-all duration-75 shadow-sm"
                  style={{
                    height: "28%",
                    top: `${Math.min(72, scrollRatio * 72)}%`,
                  }}
                />
              </div>

              <span className="text-[9px] text-inkMuted font-sans font-semibold mt-1">
                {Math.round(scrollRatio * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
