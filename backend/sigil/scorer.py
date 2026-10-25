from typing import Any
from datetime import datetime, timezone
from sigil.models import AgentModel, TaskModel, EventModel
from sigil.policy import PolicyEvaluationResult

def calculate_impact_score(
    resource_sensitivity: str,
    operation_type: str,
    data_volume: int,
    destination: str | None
) -> float:
    score = 0.1
    # Sensitivity impact
    sensitivity_map = {
        "low": 0.1,
        "medium": 0.3,
        "high": 0.6,
        "confidential": 0.85,
        "critical": 1.0
    }
    score += sensitivity_map.get(resource_sensitivity.lower(), 0.2)

    # Operation destructiveness / reversibility
    destructive_ops = ["export", "bulk_export", "delete", "write", "modify_permissions", "payment", "external_transfer"]
    if any(op in operation_type.lower() for op in destructive_ops):
        score += 0.3

    # Volume impact
    if data_volume > 100:
        score += 0.3
    elif data_volume > 20:
        score += 0.15

    # External destination
    if destination and ("external" in destination.lower() or "unapproved" in destination.lower() or "pastebin" in destination.lower() or "dropbox" in destination.lower() or "temp" in destination.lower()):
        score += 0.35

    return min(1.0, score)

def calculate_behavioral_score(
    recent_events: list[EventModel],
    tool_name: str,
    target_resource: str,
    data_volume: int
) -> float:
    """
    Evaluates rolling historical behavior (B).
    Checks frequency spikes, novel resource clusters, cumulative volume acceleration.
    """
    if not recent_events:
        # Cold start baseline: not anomalous in itself, handled by P and safe profile
        return 0.1

    # Frequency check (events in short timeframe)
    count = len(recent_events)
    if count > 15:
        freq_penalty = 0.4
    elif count > 8:
        freq_penalty = 0.2
    else:
        freq_penalty = 0.05

    # Volume acceleration / gradual drift pattern
    past_volumes = [e.data_volume for e in recent_events if e.data_volume]
    avg_vol = sum(past_volumes) / max(len(past_volumes), 1)
    vol_penalty = 0.0
    if data_volume > avg_vol * 3 and data_volume > 10:
        vol_penalty = 0.4
    elif data_volume > avg_vol * 1.5:
        vol_penalty = 0.2

    # Tool novelty
    used_tools = {e.tool_name for e in recent_events}
    tool_penalty = 0.3 if tool_name not in used_tools else 0.0

    return min(1.0, freq_penalty + vol_penalty + tool_penalty)

def calculate_context_score(
    input_provenance: dict[str, Any] | None,
    parent_agent_id: str | None
) -> float:
    """
    Module 4 / USP 5 & 7: Suspicious context (C).
    Checks for untrusted document provenance (indirect injection vector)
    and multi-agent delegation propagation.
    """
    score = 0.0
    if input_provenance:
        source_trust = input_provenance.get("trust_level", "trusted").lower()
        if source_trust in ["untrusted", "external_web", "public_upload", "raw_email"]:
            score += 0.5
        if input_provenance.get("contains_instruction_override") or input_provenance.get("injection_indicators"):
            score += 0.4

    if parent_agent_id:
        score += 0.2

    return min(1.0, score)

def compute_risk_assessment(
    agent: AgentModel,
    task: TaskModel | None,
    policy_res: PolicyEvaluationResult,
    recent_events: list[EventModel],
    tool_name: str,
    operation_type: str,
    target_resource: str,
    resource_sensitivity: str,
    data_volume: int,
    destination: str | None,
    input_provenance: dict[str, Any] | None,
    parent_agent_id: str | None
) -> dict[str, Any]:
    """
    Module 5: Computes R = 100 * (0.35*P + 0.25*T + 0.15*B + 0.15*I + 0.10*C)
    Generates explainable evidence and response recommendation.
    """
    # 1. P signal (Explicit policy violation)
    if policy_res.is_hard_violation:
        P = 1.0
    elif policy_res.requires_approval:
        P = 0.5
    else:
        P = 0.0

    # 2. T signal (Task mismatch)
    T = 0.0
    if task:
        task_scope = [s.lower() for s in (task.authorized_scope or [])]
        if not any(s in target_resource.lower() for s in task_scope):
            T = 0.9
        elif destination and destination not in (task.approved_destinations or []):
            T = 0.75
        elif data_volume > (task.max_data_volume or 50):
            T = 0.5
    else:
        T = 0.3 if policy_res.is_hard_violation else 0.0

    # 3. B signal (Behavioral anomaly)
    B = calculate_behavioral_score(recent_events, tool_name, target_resource, data_volume)

    # 4. I signal (Potential impact)
    I = calculate_impact_score(resource_sensitivity, operation_type, data_volume, destination)

    # 5. C signal (Context / provenance / delegation)
    C = calculate_context_score(input_provenance, parent_agent_id)

    # Prototype scoring formula:
    # R = 100 * (0.35*P + 0.25*T + 0.15*B + 0.15*I + 0.10*C)
    R = round(100.0 * (0.35 * P + 0.25 * T + 0.15 * B + 0.15 * I + 0.10 * C), 1)

    # Determine Severity
    if R >= 75 or policy_res.is_hard_violation:
        severity = "CRITICAL" if policy_res.is_hard_violation and I > 0.7 else "HIGH"
    elif R >= 45 or policy_res.requires_approval:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    # Determine Confidence based on corroborating signals
    active_signals = sum(1 for s in [P > 0, T > 0.4, B > 0.3, I > 0.5, C > 0.3] if s)
    confidence = round(min(0.98, 0.65 + (active_signals * 0.08)), 2)

    # Recommended Response & Enforced Decision
    if policy_res.is_hard_violation:
        recommended_response = "BLOCK"
        enforced_response = "BLOCK"
    elif policy_res.requires_approval or (R >= 50 and R < 80):
        recommended_response = "HOLD_FOR_APPROVAL"
        enforced_response = "HOLD_FOR_APPROVAL"
    elif R >= 80:
        recommended_response = "BLOCK"
        enforced_response = "BLOCK"
    else:
        recommended_response = "ALLOW"
        enforced_response = "ALLOW"

    # Generate Evidence-backed structured explanation (USP 2)
    evidence_items = []
    if policy_res.violated_rules:
        for r in policy_res.violated_rules:
            evidence_items.append(f"Policy rule violation: {r}")
    if policy_res.requires_approval and policy_res.approval_reason:
        evidence_items.append(f"Approval threshold triggered: {policy_res.approval_reason}")
    if T > 0.4:
        evidence_items.append(f"Task alignment mismatch: Resource '{target_resource}' not in task scope '{task.title if task else 'Unknown'}'")
    if B > 0.3:
        evidence_items.append(f"Behavioral divergence: anomalous volume or frequency shift (B={B:.2f})")
    if I > 0.5:
        evidence_items.append(f"High impact risk: Sensitivity is '{resource_sensitivity}' with operation '{operation_type}' (I={I:.2f})")
    if C > 0.3:
        evidence_items.append(f"Suspicious context: Untrusted provenance or delegated execution chain detected (C={C:.2f})")

    if enforced_response == "BLOCK":
        action_summary = f"The operation was technical-blocked at the gateway prior to execution."
    elif enforced_response == "HOLD_FOR_APPROVAL":
        action_summary = f"The operation has been held in pending queue until security approval is verified."
    else:
        action_summary = f"The operation was verified safe within policy boundaries and allowed."

    explanation = (
        f"{severity} risk (Score {R}/100, Confidence {int(confidence*100)}%): "
        f"Agent '{agent.name}' ({agent.role}) attempted '{operation_type}' on '{target_resource}' using tool '{tool_name}'. "
        f"{' '.join(evidence_items[:2])} {action_summary}"
    )

    return {
        "risk_score": R,
        "severity": severity,
        "confidence": confidence,
        "signals": {
            "P": round(P, 2),
            "T": round(T, 2),
            "B": round(B, 2),
            "I": round(I, 2),
            "C": round(C, 2)
        },
        "policy_status": policy_res.policy_status,  # "allowed", "prohibited", "not_covered", "requires_approval"
        "recommended_response": recommended_response,
        "enforced_response": enforced_response,
        "explanation": explanation,
        "evidence": evidence_items
    }
