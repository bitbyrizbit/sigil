import uuid
from typing import Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sigil.models import (
    AgentModel, TaskModel, EventModel, AlertModel, ApprovalModel, AuditRecordModel, utc_now
)
from sigil.policy import evaluate_hard_policies
from sigil.scorer import compute_risk_assessment

# Simulated Protected Tools (Execution layer outside the agent)
def execute_simulated_tool(tool_name: str, operation_type: str, target_resource: str, parameters: dict[str, Any]) -> dict[str, Any]:
    """
    Simulated real protected tools that execute ONLY when allowed by Sigil Gateway.
    Disallowed or held actions NEVER reach here.
    """
    if tool_name == "web_search":
        return {
            "status": "success",
            "results": [
                f"Paper: Post-Quantum Cryptographic Protocols in Autonomous Systems (Resource: {target_resource})",
                "Summary: Analysis of lattice-based lattice signatures and zero-trust agent authorization."
            ]
        }
    elif tool_name == "approved_document_reader":
        return {
            "status": "success",
            "content": f"Verified documentation payload from {target_resource}. Scope verified compliant with research mandate."
        }
    elif tool_name == "text_summarizer":
        return {
            "status": "success",
            "summary": f"Executive summary generated for target: {target_resource}."
        }
    elif tool_name == "invoice_reader":
        return {
            "status": "success",
            "invoices": [
                {"invoice_id": "INV-2026-891", "vendor": "CloudHost Global", "amount": 4200.0, "status": "approved_po"}
            ]
        }
    elif tool_name == "payment_recommender":
        return {
            "status": "success",
            "recommendation": "Payment draft generated for finance signoff. Status: DRAFT_READY."
        }
    elif tool_name == "customer_db_reader":
        return {
            "status": "success",
            "customer_record": {"account_id": "CUST-9921", "name": "Standard Customer", "order_ref": target_resource}
        }
    elif tool_name == "refund_processor":
        amount = parameters.get("amount", 25.0)
        return {
            "status": "success",
            "refund_id": f"REF-{uuid.uuid4().hex[:6].upper()}",
            "amount": amount,
            "message": f"Refund of ${amount} credited successfully to customer account."
        }
    elif tool_name == "support_ticket_manager":
        return {
            "status": "success",
            "ticket_status": "UPDATED",
            "note": parameters.get("note", "Ticket updated with resolution details.")
        }
    return {
        "status": "success",
        "output": f"Executed protected tool '{tool_name}' for resource '{target_resource}'."
    }

class GatewayResponse:
    def __init__(
        self,
        event_id: str,
        decision: str,
        execution_status: str,
        risk_score: float,
        severity: str,
        confidence: float,
        explanation: str,
        evidence: list[str],
        policy_status: str = "allowed",
        tool_output: dict[str, Any] | None = None,
        approval_id: str | None = None,
        alert_id: str | None = None
    ):
        self.event_id = event_id
        self.decision = decision  # ALLOW, HOLD_FOR_APPROVAL, BLOCK, ISOLATE
        self.execution_status = execution_status  # executed, held, blocked
        self.risk_score = risk_score
        self.severity = severity
        self.confidence = confidence
        self.explanation = explanation
        self.evidence = evidence
        self.policy_status = policy_status
        self.tool_output = tool_output
        self.approval_id = approval_id
        self.alert_id = alert_id

    def to_dict(self):
        return {
            "event_id": self.event_id,
            "decision": self.decision,
            "execution_status": self.execution_status,
            "risk_score": self.risk_score,
            "severity": self.severity,
            "confidence": self.confidence,
            "explanation": self.explanation,
            "evidence": self.evidence,
            "policy_status": self.policy_status,
            "tool_output": self.tool_output,
            "approval_id": self.approval_id,
            "alert_id": self.alert_id
        }

def process_tool_call(
    db: Session,
    agent_id: str,
    tool_name: str,
    operation_type: str,
    target_resource: str,
    resource_sensitivity: str = "low",
    action_parameters: dict[str, Any] | None = None,
    task_id: str | None = None,
    initiating_user: str = "system_operator",
    session_id: str = "sess_001",
    parent_agent_id: str | None = None,
    data_volume: int = 1,
    destination: str | None = None,
    input_provenance: dict[str, Any] | None = None,
    configuration_changes: dict[str, Any] | None = None
) -> GatewayResponse:
    """
    Core Runtime Gateway:
    ALL tool calls pass through this interceptor before reaching actual tools.
    Connects:
      Module 1 (Registry) ->
      Module 2 (Collector) ->
      Module 3 (Hard policies / Cold start) ->
      Module 4 (Contextual signals) ->
      Module 5 (Risk scoring & Evidence) ->
      Module 6 (Independent response & Containment) ->
      Module 7 (Audit record answering 9 questions).
    """
    action_params = action_parameters or {}
    event_id = f"evt_{uuid.uuid4().hex[:8]}"

    # 1. Lookup Agent in Registry
    agent = db.query(AgentModel).filter(AgentModel.agent_id == agent_id).first()
    if not agent:
        # Cold start for unregistered agent
        # Safe initial profile: unknown agent attempting action -> BLOCK immediately
        block_explanation = f"Critical risk: Unregistered agent '{agent_id}' attempted to execute '{tool_name}'. Blocked by cold-start zero-trust policy."
        alert_id = f"alt_{uuid.uuid4().hex[:8]}"
        
        event = EventModel(
            event_id=event_id,
            agent_id=agent_id,
            initiating_user=initiating_user,
            session_id=session_id,
            parent_agent_id=parent_agent_id,
            task_id=task_id,
            tool_name=tool_name,
            operation_type=operation_type,
            target_resource=target_resource,
            resource_sensitivity=resource_sensitivity,
            action_parameters=action_params,
            policy_version="0.0",
            authorization_decision="BLOCK",
            result="denied",
            data_volume=data_volume,
            destination=destination,
            action_frequency=1.0,
            input_provenance=input_provenance,
            configuration_changes=configuration_changes,
            risk_score=100.0
        )
        db.add(event)
        
        audit = AuditRecordModel(
            audit_id=f"aud_{uuid.uuid4().hex[:8]}",
            agent_id=agent_id,
            initiating_user=initiating_user,
            parent_agent_id=parent_agent_id,
            task_id=task_id,
            task_scope=["unregistered_agent"],
            attempted_action=f"{operation_type} via {tool_name}",
            tool_name=tool_name,
            target_resource=target_resource,
            action_parameters=action_params,
            policy_version="0.0",
            evaluated_rules=["Zero-trust cold-start registration rule"],
            signals={"P": 1.0, "T": 1.0, "B": 1.0, "I": 1.0, "C": 1.0},
            decision="BLOCK",
            explanation=block_explanation,
            tool_execution_outcome="Tool call suppressed before execution",
            containment_action="Out-of-registry block"
        )
        db.add(audit)
        db.commit()

        return GatewayResponse(
            event_id=event_id,
            decision="BLOCK",
            execution_status="blocked",
            risk_score=100.0,
            severity="CRITICAL",
            confidence=0.99,
            explanation=block_explanation,
            evidence=["Agent identity is not registered in the system registry"],
            policy_status="prohibited",
            tool_output=None,
            alert_id=alert_id
        )

    # 2. Lookup Task
    task = None
    if task_id:
        task = db.query(TaskModel).filter(TaskModel.task_id == task_id).first()

    # 3. Retrieve Recent Events for Rolling History (Module 4 / USP 4)
    recent_events = (
        db.query(EventModel)
        .filter(EventModel.agent_id == agent_id)
        .order_by(EventModel.timestamp.desc())
        .limit(20)
        .all()
    )

    # 4. Evaluate Hard Policies (Module 3)
    policy_res = evaluate_hard_policies(
        agent=agent,
        task=task,
        tool_name=tool_name,
        operation_type=operation_type,
        target_resource=target_resource,
        data_volume=data_volume,
        destination=destination,
        action_parameters=action_params
    )

    # 5. Compute Risk Assessment & Evidence (Module 4 & 5)
    assessment = compute_risk_assessment(
        agent=agent,
        task=task,
        policy_res=policy_res,
        recent_events=recent_events,
        tool_name=tool_name,
        operation_type=operation_type,
        target_resource=target_resource,
        resource_sensitivity=resource_sensitivity,
        data_volume=data_volume,
        destination=destination,
        input_provenance=input_provenance,
        parent_agent_id=parent_agent_id
    )

    decision = assessment["enforced_response"]
    risk_score = assessment["risk_score"]
    severity = assessment["severity"]
    confidence = assessment["confidence"]
    explanation = assessment["explanation"]
    evidence = assessment["evidence"]
    signals = assessment["signals"]

    # 6. Record Event in Event Collector FIRST (satisfies PostgreSQL FK constraint)
    event = EventModel(
        event_id=event_id,
        agent_id=agent_id,
        initiating_user=initiating_user,
        session_id=session_id,
        parent_agent_id=parent_agent_id,
        task_id=task_id,
        tool_name=tool_name,
        operation_type=operation_type,
        target_resource=target_resource,
        resource_sensitivity=resource_sensitivity,
        action_parameters=action_params,
        policy_version=agent.policy_version,
        authorization_decision=decision,
        result="allowed" if decision == "ALLOW" else ("pending_approval" if decision == "HOLD_FOR_APPROVAL" else "blocked"),
        data_volume=data_volume,
        destination=destination,
        action_frequency=1.0,
        input_provenance=input_provenance,
        configuration_changes=configuration_changes,
        risk_score=risk_score
    )
    db.add(event)
    db.flush()

    # 7. Enforce Response Proportionately (Module 6)
    tool_output = None
    approval_id = None
    alert_id = None
    execution_status = "blocked"
    containment_action = "none"

    if decision == "ALLOW":
        # Safe: execute tool outside the agent
        tool_output = execute_simulated_tool(tool_name, operation_type, target_resource, action_params)
        execution_status = "executed"
        containment_action = "allowed_within_policy"

    elif decision == "HOLD_FOR_APPROVAL":
        # Hold: do NOT execute tool. Enqueue for human approval
        approval_id = f"appr_{uuid.uuid4().hex[:8]}"
        approval = ApprovalModel(
            approval_id=approval_id,
            event_id=event_id,
            agent_id=agent_id,
            action_summary=f"Attempted {operation_type} on {target_resource} via {tool_name}",
            target_resource=target_resource,
            requested_tool=tool_name,
            operation_type=operation_type,
            action_parameters=action_params,
            data_volume=data_volume,
            status="PENDING",
            requested_at=utc_now(),
            justification=explanation
        )
        db.add(approval)
        execution_status = "held"
        containment_action = "held_in_approval_queue"

        # Also create alert for visibility
        alert_id = f"alt_{uuid.uuid4().hex[:8]}"
        alert = AlertModel(
            alert_id=alert_id,
            event_id=event_id,
            agent_id=agent_id,
            severity=severity,
            confidence=confidence,
            risk_score=risk_score,
            policy_status=assessment.get("policy_status", "requires_approval"),
            recommended_response="HOLD_FOR_APPROVAL",
            enforced_response="HOLD_FOR_APPROVAL",
            explanation=explanation,
            evidence=evidence,
            signals=signals,
            status="OPEN"
        )
        db.add(alert)

    elif decision == "BLOCK":
        # Disallow: technical block before reaching tool
        execution_status = "blocked"
        containment_action = "technical_gateway_block"

        # Create incident alert
        alert_id = f"alt_{uuid.uuid4().hex[:8]}"
        alert = AlertModel(
            alert_id=alert_id,
            event_id=event_id,
            agent_id=agent_id,
            severity=severity,
            confidence=confidence,
            risk_score=risk_score,
            policy_status=assessment.get("policy_status", "prohibited"),
            recommended_response=assessment["recommended_response"],
            enforced_response="BLOCK",
            explanation=explanation,
            evidence=evidence,
            signals=signals,
            status="OPEN"
        )
        db.add(alert)

    # 8. Record Audit Trail answering the 9 questions (Module 7)
    # 1. Which agent initiated? agent_id
    # 2. Which user or parent agent initiated? initiating_user, parent_agent_id
    # 3. What task was active? task.title / task_id
    # 4. What did agent attempt? operation_type via tool_name on target_resource
    # 5. Which policy and evidence evaluated? policy_version, evaluated_rules, signals
    # 6. Why allowed/challenged/blocked? explanation
    # 7. What actually happened at tool/API? execution_status outcome
    # 8. Which containment action was taken? containment_action
    # 9. Who approved/resolved? (initially None, filled upon resolution)
    audit = AuditRecordModel(
        audit_id=f"aud_{uuid.uuid4().hex[:8]}",
        agent_id=agent_id,
        initiating_user=initiating_user,
        parent_agent_id=parent_agent_id,
        task_id=task_id,
        task_scope=task.authorized_scope if task else ([agent.task_scope] if isinstance(agent.task_scope, str) else agent.task_scope),
        attempted_action=f"{operation_type} on {target_resource} via {tool_name}",
        tool_name=tool_name,
        target_resource=target_resource,
        action_parameters=action_params,
        policy_version=agent.policy_version,
        evaluated_rules=evidence,
        signals=signals,
        decision=decision,
        explanation=explanation,
        tool_execution_outcome="Protected tool executed successfully" if execution_status == "executed" else "Protected tool call PREVENTED before execution",
        containment_action=containment_action
    )
    db.add(audit)

    db.commit()

    return GatewayResponse(
        event_id=event_id,
        decision=decision,
        execution_status=execution_status,
        risk_score=risk_score,
        severity=severity,
        confidence=confidence,
        explanation=explanation,
        evidence=evidence,
        policy_status=assessment.get("policy_status", "allowed"),
        tool_output=tool_output,
        approval_id=approval_id,
        alert_id=alert_id
    )
