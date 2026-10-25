from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sigil.models import AgentModel, ApprovalModel, AlertModel, AuditRecordModel, EventModel, utc_now
from sigil.gateway import execute_simulated_tool

def resolve_approval(
    db: Session,
    approval_id: str,
    action: str,  # "APPROVE" or "REJECT"
    resolved_by: str,
    justification: str | None = None,
    verify_target: str | None = None,
    verify_tool: str | None = None
) -> dict:
    approval = db.query(ApprovalModel).filter(ApprovalModel.approval_id == approval_id).first()
    if not approval:
        return {"status": "error", "message": f"Approval request {approval_id} not found"}

    if approval.status != "PENDING":
        return {"status": "error", "message": f"Approval request {approval_id} is already {approval.status}"}

    # Hard Security Rule: An agent CANNOT approve its own held action or any held action
    if resolved_by == approval.agent_id or resolved_by.lower().startswith("agent_"):
        return {
            "status": "error",
            "message": f"Security violation: Agent '{resolved_by}' cannot approve held operations. Independent human operator verification required."
        }

    # Hard Binding Check: Verify exact target and tool match
    if verify_target and verify_target != approval.target_resource:
        return {
            "status": "error",
            "message": f"Security binding mismatch: Approval target '{approval.target_resource}' does not match requested execution target '{verify_target}'"
        }
    if verify_tool and verify_tool != approval.requested_tool:
        return {
            "status": "error",
            "message": f"Security binding mismatch: Approval tool '{approval.requested_tool}' does not match requested execution tool '{verify_tool}'"
        }

    approval.resolved_at = utc_now()
    approval.resolved_by = resolved_by
    approval.justification = justification

    event = db.query(EventModel).filter(EventModel.event_id == approval.event_id).first()
    tool_output = None

    if action == "APPROVE":
        approval.status = "APPROVED"
        if event:
            event.result = "allowed"
            event.authorization_decision = "APPROVED_BY_ADMIN"
            # Execute held tool with original bounded parameters
            exec_params = dict(approval.action_parameters or {})
            exec_params["approved_by"] = resolved_by
            tool_output = execute_simulated_tool(
                tool_name=approval.requested_tool,
                operation_type=approval.operation_type or "approved_execution",
                target_resource=approval.target_resource,
                parameters=exec_params
            )
        
        # Update audit record
        audit = db.query(AuditRecordModel).filter(AuditRecordModel.target_resource == approval.target_resource).order_by(AuditRecordModel.timestamp.desc()).first()
        if audit:
            audit.resolved_by = resolved_by
            audit.resolution_notes = f"Exception approved by {resolved_by}. Justification: {justification}"
            audit.tool_execution_outcome = "Executed after verified security approval"

    else:
        approval.status = "REJECTED"
        if event:
            event.result = "blocked"
            event.authorization_decision = "REJECTED_BY_ADMIN"
        
        audit = db.query(AuditRecordModel).filter(AuditRecordModel.target_resource == approval.target_resource).order_by(AuditRecordModel.timestamp.desc()).first()
        if audit:
            audit.resolved_by = resolved_by
            audit.resolution_notes = f"Approval rejected by {resolved_by}. Justification: {justification}"
            audit.tool_execution_outcome = "Execution terminated by administrator denial"

    # Also resolve linked alert if present
    alert = db.query(AlertModel).filter(AlertModel.event_id == approval.event_id).first()
    if alert:
        alert.status = "RESOLVED"

    db.commit()
    db.refresh(approval)

    return {
        "status": "success",
        "approval_id": approval.approval_id,
        "new_status": approval.status,
        "resolved_by": resolved_by,
        "tool_output": tool_output
    }

def update_agent_containment(
    db: Session,
    agent_id: str,
    action: str,  # "PAUSE", "RESTRICT", "ISOLATE", "RESUME"
    operator: str,
    reason: str
) -> dict:
    agent = db.query(AgentModel).filter(AgentModel.agent_id == agent_id).first()
    if not agent:
        return {"status": "error", "message": f"Agent {agent_id} not found"}

    status_map = {
        "PAUSE": "paused",
        "RESTRICT": "restricted",
        "ISOLATE": "isolated",
        "RESUME": "active"
    }

    new_status = status_map.get(action.upper())
    if not new_status:
        return {"status": "error", "message": f"Invalid containment action '{action}'"}

    old_status = agent.status
    agent.status = new_status

    # Record containment audit event
    audit = AuditRecordModel(
        audit_id=f"aud_cont_{utc_now().timestamp():.0f}",
        agent_id=agent_id,
        initiating_user=operator,
        parent_agent_id=None,
        task_id=None,
        task_scope=["containment_operation"],
        attempted_action=f"Containment state change: {old_status} -> {new_status}",
        tool_name="sigil_containment_manager",
        target_resource=f"agent:{agent_id}",
        action_parameters={"action": action, "operator": operator, "reason": reason},
        policy_version=agent.policy_version,
        evaluated_rules=[f"Operator containment rule applied: {action}"],
        signals={"P": 0.0, "T": 0.0, "B": 0.0, "I": 0.8, "C": 0.0},
        decision=action,
        explanation=f"Agent '{agent.name}' status transitioned from {old_status} to {new_status} by operator {operator}. Reason: {reason}",
        tool_execution_outcome="Containment state enforced",
        containment_action=f"Agent set to {new_status}",
        resolved_by=operator,
        resolution_notes=reason
    )
    db.add(audit)
    db.commit()
    db.refresh(agent)

    return {
        "status": "success",
        "agent_id": agent.agent_id,
        "previous_status": old_status,
        "current_status": agent.status,
        "containment_action": action
    }

def resolve_alert(
    db: Session,
    alert_id: str,
    new_status: str,  # "ACKNOWLEDGED", "RESOLVED", "DISMISSED"
    resolved_by: str,
    notes: str | None = None
) -> dict:
    alert = db.query(AlertModel).filter(AlertModel.alert_id == alert_id).first()
    if not alert:
        return {"status": "error", "message": f"Alert {alert_id} not found"}

    alert.status = new_status
    db.commit()
    return {
        "status": "success",
        "alert_id": alert_id,
        "new_status": new_status,
        "resolved_by": resolved_by
    }
