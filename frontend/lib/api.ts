const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchSummary() {
  const res = await fetch(`${API_BASE}/api/dashboard/summary`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  return res.json();
}

export async function fetchAgents() {
  const res = await fetch(`${API_BASE}/api/agents`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch agents");
  return res.json();
}

export async function fetchEvents(agentId?: string, decision?: string) {
  let url = `${API_BASE}/api/events?limit=50`;
  if (agentId) url += `&agent_id=${encodeURIComponent(agentId)}`;
  if (decision) url += `&decision=${encodeURIComponent(decision)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function fetchAlerts(status?: string, severity?: string) {
  let url = `${API_BASE}/api/alerts?limit=50`;
  if (status) url += `&status=${encodeURIComponent(status)}`;
  if (severity) url += `&severity=${encodeURIComponent(severity)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function resolveAlert(alertId: string, status: string, notes?: string) {
  const res = await fetch(`${API_BASE}/api/alerts/${alertId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, notes, resolved_by: "Security Operator" }),
  });
  if (!res.ok) throw new Error("Failed to resolve alert");
  return res.json();
}

export async function fetchTimeline() {
  const res = await fetch(`${API_BASE}/api/timeline?limit=50`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch timeline");
  return res.json();
}

export async function fetchPolicies() {
  const res = await fetch(`${API_BASE}/api/policies`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch policies");
  return res.json();
}

export async function updatePolicy(payload: any) {
  const res = await fetch(`${API_BASE}/api/policies/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update policy");
  return res.json();
}

export async function fetchApprovals() {
  const res = await fetch(`${API_BASE}/api/approvals`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch approvals");
  return res.json();
}

export async function resolveApproval(approvalId: string, action: "APPROVE" | "REJECT", justification?: string) {
  const res = await fetch(`${API_BASE}/api/approvals/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approval_id: approvalId, action, justification, resolved_by: "Security Supervisor" }),
  });
  if (!res.ok) throw new Error("Failed to resolve approval");
  return res.json();
}

export async function updateContainment(agentId: string, action: string, reason?: string) {
  const res = await fetch(`${API_BASE}/api/containment/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent_id: agentId, action, reason: reason || "Console containment update", operator: "Security Admin" }),
  });
  if (!res.ok) throw new Error("Failed to update containment status");
  return res.json();
}

export async function fetchEvaluationMetrics() {
  const res = await fetch(`${API_BASE}/api/evaluation`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch evaluation metrics");
  return res.json();
}

export async function runEvaluation() {
  const res = await fetch(`${API_BASE}/api/evaluation/run`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to run evaluation benchmark");
  return res.json();
}

export async function runScenarios() {
  const res = await fetch(`${API_BASE}/api/scenarios/run`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to run scenarios");
  return res.json();
}

export async function seedRegistry() {
  const res = await fetch(`${API_BASE}/api/seed`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to seed registry");
  return res.json();
}

export async function executeGateway(payload: any) {
  const res = await fetch(`${API_BASE}/api/gateway/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Gateway execution failed");
  }
  return res.json();
}
