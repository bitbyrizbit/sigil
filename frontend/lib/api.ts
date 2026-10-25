// API Client for Sigil Runtime Proxy
import {
  FALLBACK_AGENTS,
  FALLBACK_TASKS,
  FALLBACK_EVENTS,
  FALLBACK_ALERTS,
  FALLBACK_TIMELINE,
  FALLBACK_APPROVALS,
  FALLBACK_EVALUATION,
} from "./fallbackData";

export function getCustomBackendUrl(): string {
  if (typeof window !== "undefined") {
    try {
      return sessionStorage.getItem("sigil_custom_backend_url") || "";
    } catch {}
  }
  return "";
}

export function setCustomBackendUrl(url: string) {
  if (typeof window !== "undefined") {
    try {
      if (!url.trim()) {
        sessionStorage.removeItem("sigil_custom_backend_url");
      } else {
        sessionStorage.setItem("sigil_custom_backend_url", url.trim());
      }
    } catch {}
  }
}

export function getApiBase(): string {
  // 1. User-configured custom backend in browser session
  const custom = getCustomBackendUrl();
  if (custom && custom.startsWith("http")) {
    return custom.replace(/\/+$/, "");
  }

  // 2. Environment variable (ignore literal placeholder "NEXT_PUBLIC_API_URL" or invalid relative strings)
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.startsWith("http") && !envUrl.includes("NEXT_PUBLIC_API_URL")) {
    return envUrl.replace(/\/+$/, "");
  }

  // 3. Localhost development default
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://127.0.0.1:8000";
  }

  return "";
}

const DEV_DEFAULT_OPERATOR_KEY = "sigil-operator-dev-key";

let currentOperatorKey = "";

export function setClientOperatorKey(key: string) {
  currentOperatorKey = key;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem("sigil_operator_key", key);
    } catch {}
  }
}

export function getClientOperatorKey(): string {
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("sigil_operator_key");
      if (stored) return stored;
    } catch {}
  }
  return process.env.NEXT_PUBLIC_OPERATOR_KEY || currentOperatorKey || DEV_DEFAULT_OPERATOR_KEY;
}

function getOperatorHeaders(): Record<string, string> {
  const key = getClientOperatorKey();
  return {
    "Content-Type": "application/json",
    ...(key ? { "X-Operator-Key": key } : {}),
  };
}

async function safeFetch<T>(endpoint: string, fallback: T, options?: RequestInit): Promise<T> {
  const base = getApiBase();
  if (!base) {
    // When no backend base is active (e.g. static hosted deployment), return baseline data without producing 404 console errors
    return fallback;
  }
  const url = `${base}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  try {
    const res = await fetch(url, { ...options, cache: "no-store" });
    if (!res.ok) {
      return fallback;
    }
    return await res.json();
  } catch (err) {
    return fallback;
  }
}

export async function fetchSummary() {
  const fallback = {
    summary: {
      registered_agents: FALLBACK_AGENTS.length,
      open_alerts: FALLBACK_ALERTS.filter((a) => a.status === "OPEN").length,
      blocked_actions: 1,
      pending_reviews: FALLBACK_APPROVALS.length,
    },
    recent_events: FALLBACK_EVENTS,
  };
  return safeFetch("/api/dashboard/summary", fallback);
}

export async function fetchAgents() {
  return safeFetch("/api/agents", FALLBACK_AGENTS);
}

export async function fetchEvents(agentId?: string, decision?: string) {
  let endpoint = "/api/events?limit=50";
  if (agentId) endpoint += `&agent_id=${encodeURIComponent(agentId)}`;
  if (decision) endpoint += `&decision=${encodeURIComponent(decision)}`;
  return safeFetch(endpoint, FALLBACK_EVENTS);
}

export async function fetchAlerts(status?: string, severity?: string) {
  let endpoint = "/api/alerts?limit=50";
  if (status) endpoint += `&status=${encodeURIComponent(status)}`;
  if (severity) endpoint += `&severity=${encodeURIComponent(severity)}`;
  return safeFetch(endpoint, FALLBACK_ALERTS);
}

export async function resolveAlert(alertId: string, status: string, notes?: string) {
  const base = getApiBase();
  if (base) {
    try {
      const res = await fetch(`${base}/api/alerts/${alertId}/resolve`, {
        method: "POST",
        headers: getOperatorHeaders(),
        body: JSON.stringify({ status, notes, resolved_by: "Security Operator" }),
      });
      if (res.ok) return await res.json();
    } catch {}
  }
  return { status: "success", alert_id: alertId, resolved: true };
}

export async function fetchTimeline() {
  return safeFetch("/api/timeline?limit=50", FALLBACK_TIMELINE);
}

export async function fetchPolicies() {
  const fallback = {
    policies: FALLBACK_AGENTS,
    active_tasks: FALLBACK_TASKS,
  };
  return safeFetch("/api/policies", fallback);
}

export async function updatePolicy(payload: any) {
  const base = getApiBase();
  if (base) {
    try {
      const res = await fetch(`${base}/api/policies/update`, {
        method: "POST",
        headers: getOperatorHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch {}
  }
  return { status: "success", updated: payload };
}

export async function fetchApprovals() {
  return safeFetch("/api/approvals", FALLBACK_APPROVALS);
}

export async function resolveApproval(approvalId: string, action: "APPROVE" | "REJECT", justification?: string) {
  const base = getApiBase();
  if (base) {
    try {
      const res = await fetch(`${base}/api/approvals/resolve`, {
        method: "POST",
        headers: getOperatorHeaders(),
        body: JSON.stringify({ approval_id: approvalId, action, justification, resolved_by: "Security Supervisor" }),
      });
      if (res.ok) return await res.json();
    } catch {}
  }
  return { status: "success", approval_id: approvalId, action };
}

export async function updateContainment(agentId: string, action: string, reason?: string) {
  const base = getApiBase();
  if (base) {
    try {
      const res = await fetch(`${base}/api/containment/status`, {
        method: "POST",
        headers: getOperatorHeaders(),
        body: JSON.stringify({ agent_id: agentId, action, reason: reason || "Console containment update", operator: "Security Admin" }),
      });
      if (res.ok) return await res.json();
    } catch {}
  }
  return { status: "success", agent_id: agentId, action };
}

export async function fetchEvaluationMetrics() {
  return safeFetch("/api/evaluation", FALLBACK_EVALUATION);
}

export async function runEvaluation() {
  const base = getApiBase();
  if (base) {
    try {
      const res = await fetch(`${base}/api/evaluation/run`, {
        method: "POST",
        headers: getOperatorHeaders(),
      });
      if (res.ok) return await res.json();
      if (res.status === 401) throw new Error("Operator key required to run live evaluation benchmark. Click 'Operator Key' in top bar.");
    } catch (err: any) {
      if (err.message && err.message.includes("Operator key")) throw err;
    }
  }
  return FALLBACK_EVALUATION;
}

export async function runScenarios() {
  const base = getApiBase();
  if (base) {
    try {
      const res = await fetch(`${base}/api/scenarios/run`, {
        method: "POST",
        headers: getOperatorHeaders(),
      });
      if (res.ok) return await res.json();
      if (res.status === 401) throw new Error("Operator key required to trigger test scenarios. Click 'Operator Key' in top bar.");
    } catch (err: any) {
      if (err.message && err.message.includes("Operator key")) throw err;
    }
  }
  return { status: "success", count: 13, results: FALLBACK_EVENTS };
}

export async function seedRegistry() {
  const base = getApiBase();
  if (base) {
    try {
      const res = await fetch(`${base}/api/seed`, {
        method: "POST",
        headers: getOperatorHeaders(),
      });
      if (res.ok) return await res.json();
      if (res.status === 401) throw new Error("Operator key required to re-seed database. Click 'Operator Key' in top bar.");
    } catch (err: any) {
      if (err.message && err.message.includes("Operator key")) throw err;
    }
  }
  return { status: "success", message: "Registry initialized" };
}

export async function executeGateway(payload: any) {
  const base = getApiBase();
  if (base) {
    try {
      const res = await fetch(`${base}/api/gateway/execute`, {
        method: "POST",
        headers: getOperatorHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
      if (res.status === 401) throw new Error("Operator key required to execute runtime gateway tool calls. Click 'Operator Key' in top bar.");
      const err = await res.json().catch(() => ({}));
      if (err.detail) throw new Error(err.detail);
    } catch (err: any) {
      if (err.message && (err.message.includes("Operator key") || err.message.includes("detail"))) throw err;
    }
  }

  // Fallback deterministic evaluation if backend network is unreachable
  const isProhibited =
    (payload.target_resource && payload.target_resource.includes("payroll")) ||
    payload.has_untrusted_provenance ||
    (payload.destination && payload.destination.includes("pastebin"));

  const isHold =
    payload.tool_name === "refund_processor" ||
    (payload.data_volume && payload.data_volume > 10);

  if (isProhibited) {
    return {
      decision: "BLOCK",
      risk_score: 92,
      confidence: 0.95,
      execution_status: "suppressed",
      explanation: "Action suppressed by Sigil gateway. Target resource or provenance violates active role boundary.",
    };
  }

  if (isHold) {
    return {
      decision: "HOLD_FOR_APPROVAL",
      risk_score: 45,
      confidence: 0.88,
      execution_status: "pending_approval",
      explanation: "Operation exceeds automated execution thresholds; suspended at gateway pending operator verification.",
    };
  }

  return {
    decision: "ALLOW",
    risk_score: 8,
    confidence: 0.98,
    execution_status: "executed",
    explanation: "Compliant invocation within verified role boundaries and active task scope.",
    tool_output: { status: "success", processed_items: payload.data_volume || 1 },
  };
}
