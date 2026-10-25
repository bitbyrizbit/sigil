from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sigil.db import get_db
from sigil.models import (
    AgentModel, TaskModel, EventModel, AlertModel, ApprovalModel, AuditRecordModel
)
from sigil.registry import get_all_agents, get_agent, seed_registry, DEFAULT_AGENTS
from sigil.gateway import process_tool_call
from sigil.containment import resolve_approval, update_agent_containment, resolve_alert
from sigil.scenarios import run_all_scenarios, SCENARIO_DEFINITIONS
from sigil.evaluation import run_evaluation_benchmark

router = APIRouter(prefix="/api")

@router.get("/health")
def health():
    return {"status": "ok", "service": "Sigil Security Engine", "version": "0.1.0"}

# --- Overview Console Summary ---
@router.get("/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    agent_count = db.query(AgentModel).count()
    open_alerts = db.query(AlertModel).filter(AlertModel.status == "OPEN").count()
    blocked_actions = db.query(EventModel).filter(EventModel.authorization_decision == "BLOCK").count()
    pending_reviews = db.query(ApprovalModel).filter(ApprovalModel.status == "PENDING").count()

    recent_events = (
        db.query(EventModel)
        .order_by(EventModel.timestamp.desc())
        .limit(10)
        .all()
    )

    events_list = []
    for e in recent_events:
        agent = db.query(AgentModel).filter(AgentModel.agent_id == e.agent_id).first()
        events_list.append({
            "event_id": e.event_id,
            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            "agent_id": e.agent_id,
            "agent_name": agent.name if agent else e.agent_id,
            "role": agent.role if agent else "Unknown",
            "tool_name": e.tool_name,
            "operation_type": e.operation_type,
            "target_resource": e.target_resource,
            "decision": e.authorization_decision,
            "result": e.result,
            "risk_score": e.risk_score
        })

    return {
        "summary": {
            "registered_agents": agent_count,
            "open_alerts": open_alerts,
            "blocked_actions": blocked_actions,
            "pending_reviews": pending_reviews
        },
        "recent_events": events_list
    }

# --- Screen 1: Agent Inventory ---
@router.get("/agents")
def list_agents(db: Session = Depends(get_db)):
    agents = get_all_agents(db)
    return [
        {
            "agent_id": a.agent_id,
            "name": a.name,
            "owner": a.owner,
            "role": a.role,
            "purpose": a.purpose,
            "allowed_tools": a.allowed_tools,
            "restricted_tools": a.restricted_tools,
            "data_scope": a.data_scope,
            "permitted_actions": a.permitted_actions,
            "restricted_actions": a.restricted_actions,
            "task_scope": a.task_scope,
            "risk_profile": a.risk_profile,
            "policy_version": a.policy_version,
            "expiry_or_review_date": a.expiry_or_review_date,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in agents
    ]

@router.get("/agents/{agent_id}")
def get_agent_details(agent_id: str, db: Session = Depends(get_db)):
    agent = get_agent(db, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.post("/agents")
def create_agent(payload: dict[str, Any], db: Session = Depends(get_db)):
    agent_id = payload.get("agent_id")
    if not agent_id:
        raise HTTPException(status_code=400, detail="agent_id is required")
    existing = get_agent(db, agent_id)
    if existing:
        raise HTTPException(status_code=409, detail="Agent already exists")

    agent = AgentModel(
        agent_id=agent_id,
        name=payload.get("name", agent_id),
        owner=payload.get("owner", "General"),
        role=payload.get("role", "Assistant"),
        purpose=payload.get("purpose", ""),
        allowed_tools=payload.get("allowed_tools", []),
        restricted_tools=payload.get("restricted_tools", []),
        data_scope=payload.get("data_scope", []),
        permitted_actions=payload.get("permitted_actions", []),
        restricted_actions=payload.get("restricted_actions", []),
        task_scope=payload.get("task_scope", ""),
        risk_profile=payload.get("risk_profile", "Standard"),
        policy_version=payload.get("policy_version", "1.0"),
        expiry_or_review_date=payload.get("expiry_or_review_date", "2026-12-31"),
        status=payload.get("status", "active")
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return {"status": "success", "agent_id": agent.agent_id}

# --- Screen 2: Live Activity ---
@router.get("/events")
def list_events(
    agent_id: str | None = None,
    decision: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(EventModel).order_by(EventModel.timestamp.desc())
    if agent_id:
        query = query.filter(EventModel.agent_id == agent_id)
    if decision:
        query = query.filter(EventModel.authorization_decision == decision.upper())
    
    events = query.limit(limit).all()
    return [
        {
            "event_id": e.event_id,
            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            "agent_id": e.agent_id,
            "initiating_user": e.initiating_user,
            "session_id": e.session_id,
            "parent_agent_id": e.parent_agent_id,
            "task_id": e.task_id,
            "tool_name": e.tool_name,
            "operation_type": e.operation_type,
            "target_resource": e.target_resource,
            "resource_sensitivity": e.resource_sensitivity,
            "action_parameters": e.action_parameters,
            "policy_version": e.policy_version,
            "authorization_decision": e.authorization_decision,
            "result": e.result,
            "data_volume": e.data_volume,
            "destination": e.destination,
            "action_frequency": e.action_frequency,
            "input_provenance": e.input_provenance,
            "configuration_changes": e.configuration_changes,
            "risk_score": e.risk_score
        }
        for e in events
    ]

# --- Screen 3: Drift Alerts ---
@router.get("/alerts")
def list_alerts(
    status: str | None = None,
    severity: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(AlertModel).order_by(AlertModel.created_at.desc())
    if status:
        query = query.filter(AlertModel.status == status.upper())
    if severity:
        query = query.filter(AlertModel.severity == severity.upper())

    alerts = query.limit(limit).all()
    results = []
    for a in alerts:
        event = db.query(EventModel).filter(EventModel.event_id == a.event_id).first()
        agent = db.query(AgentModel).filter(AgentModel.agent_id == a.agent_id).first()
        results.append({
            "alert_id": a.alert_id,
            "event_id": a.event_id,
            "agent_id": a.agent_id,
            "agent_name": agent.name if agent else a.agent_id,
            "role": agent.role if agent else "Unknown",
            "severity": a.severity,
            "confidence": a.confidence,
            "risk_score": a.risk_score,
            "policy_status": a.policy_status,
            "recommended_response": a.recommended_response,
            "enforced_response": a.enforced_response,
            "explanation": a.explanation,
            "evidence": a.evidence,
            "signals": a.signals,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "tool_name": event.tool_name if event else None,
            "target_resource": event.target_resource if event else None,
            "destination": event.destination if event else None
        })
    return results

@router.post("/alerts/{alert_id}/resolve")
def resolve_alert_endpoint(
    alert_id: str,
    payload: dict[str, Any],
    db: Session = Depends(get_db)
):
    new_status = payload.get("status", "RESOLVED")
    resolved_by = payload.get("resolved_by", "security_operator")
    notes = payload.get("notes")
    return resolve_alert(db, alert_id, new_status, resolved_by, notes)

# --- Screen 4: Incident Timeline ---
@router.get("/timeline")
def get_incident_timeline(limit: int = 50, db: Session = Depends(get_db)):
    audits = (
        db.query(AuditRecordModel)
        .order_by(AuditRecordModel.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "audit_id": a.audit_id,
            "timestamp": a.timestamp.isoformat() if a.timestamp else None,
            "agent_id": a.agent_id,
            "initiating_user": a.initiating_user,
            "parent_agent_id": a.parent_agent_id,
            "task_id": a.task_id,
            "task_scope": a.task_scope,
            "attempted_action": a.attempted_action,
            "tool_name": a.tool_name,
            "target_resource": a.target_resource,
            "action_parameters": a.action_parameters,
            "policy_version": a.policy_version,
            "evaluated_rules": a.evaluated_rules,
            "signals": a.signals,
            "decision": a.decision,
            "explanation": a.explanation,
            "tool_execution_outcome": a.tool_execution_outcome,
            "containment_action": a.containment_action,
            "resolved_by": a.resolved_by,
            "resolution_notes": a.resolution_notes
        }
        for a in audits
    ]

# --- Screen 5: Policy Management ---
@router.get("/policies")
def get_policies(db: Session = Depends(get_db)):
    agents = db.query(AgentModel).all()
    tasks = db.query(TaskModel).all()
    return {
        "policies": [
            {
                "agent_id": a.agent_id,
                "name": a.name,
                "role": a.role,
                "policy_version": a.policy_version,
                "allowed_tools": a.allowed_tools,
                "restricted_tools": a.restricted_tools,
                "data_scope": a.data_scope,
                "permitted_actions": a.permitted_actions,
                "restricted_actions": a.restricted_actions,
                "task_scope": a.task_scope,
                "risk_profile": a.risk_profile,
                "expiry_or_review_date": a.expiry_or_review_date,
                "status": a.status
            }
            for a in agents
        ],
        "active_tasks": [
            {
                "task_id": t.task_id,
                "agent_id": t.agent_id,
                "title": t.title,
                "description": t.description,
                "authorized_scope": t.authorized_scope,
                "approved_destinations": t.approved_destinations,
                "max_data_volume": t.max_data_volume,
                "status": t.status
            }
            for t in tasks
        ]
    }

@router.post("/policies/update")
def update_policy(payload: dict[str, Any], db: Session = Depends(get_db)):
    agent_id = payload.get("agent_id")
    agent = db.query(AgentModel).filter(AgentModel.agent_id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if "allowed_tools" in payload:
        agent.allowed_tools = payload["allowed_tools"]
    if "restricted_tools" in payload:
        agent.restricted_tools = payload["restricted_tools"]
    if "data_scope" in payload:
        agent.data_scope = payload["data_scope"]
    if "permitted_actions" in payload:
        agent.permitted_actions = payload["permitted_actions"]
    if "restricted_actions" in payload:
        agent.restricted_actions = payload["restricted_actions"]
    if "task_scope" in payload:
        agent.task_scope = payload["task_scope"]
    if "policy_version" in payload:
        agent.policy_version = payload["policy_version"]

    db.commit()
    db.refresh(agent)
    return {"status": "success", "agent_id": agent.agent_id, "policy_version": agent.policy_version}

# --- Screen 6: Enforcement Controls ---
@router.post("/containment/status")
def set_containment_status(payload: dict[str, Any], db: Session = Depends(get_db)):
    agent_id = payload.get("agent_id")
    action = payload.get("action")  # PAUSE, RESTRICT, ISOLATE, RESUME
    operator = payload.get("operator", "security_admin")
    reason = payload.get("reason", "Operator console control")

    if not agent_id or not action:
        raise HTTPException(status_code=400, detail="agent_id and action are required")

    return update_agent_containment(db, agent_id, action, operator, reason)

@router.get("/approvals")
def list_approvals(status: str | None = None, db: Session = Depends(get_db)):
    query = db.query(ApprovalModel).order_by(ApprovalModel.requested_at.desc())
    if status:
        query = query.filter(ApprovalModel.status == status.upper())
    approvals = query.all()
    return [
        {
            "approval_id": app.approval_id,
            "event_id": app.event_id,
            "agent_id": app.agent_id,
            "action_summary": app.action_summary,
            "target_resource": app.target_resource,
            "requested_tool": app.requested_tool,
            "data_volume": app.data_volume,
            "status": app.status,
            "requested_at": app.requested_at.isoformat() if app.requested_at else None,
            "resolved_at": app.resolved_at.isoformat() if app.resolved_at else None,
            "resolved_by": app.resolved_by,
            "justification": app.justification
        }
        for app in approvals
    ]

@router.post("/approvals/resolve")
def resolve_approval_endpoint(payload: dict[str, Any], db: Session = Depends(get_db)):
    approval_id = payload.get("approval_id")
    action = payload.get("action")  # "APPROVE" or "REJECT"
    resolved_by = payload.get("resolved_by", "security_officer")
    justification = payload.get("justification")

    if not approval_id or not action:
        raise HTTPException(status_code=400, detail="approval_id and action are required")

    return resolve_approval(db, approval_id, action, resolved_by, justification)

# --- Screen 7: Evaluation Panel ---
@router.get("/evaluation")
def get_evaluation_metrics(db: Session = Depends(get_db)):
    return run_evaluation_benchmark(db)

@router.post("/evaluation/run")
def trigger_evaluation_run(db: Session = Depends(get_db)):
    return run_evaluation_benchmark(db)

# --- Tool Execution Gateway ---
@router.post("/gateway/execute")
def gateway_execute(payload: dict[str, Any], db: Session = Depends(get_db)):
    agent_id = payload.get("agent_id")
    tool_name = payload.get("tool_name")
    operation_type = payload.get("operation_type", "execute")
    target_resource = payload.get("target_resource")

    if not agent_id or not tool_name or not target_resource:
        raise HTTPException(status_code=400, detail="agent_id, tool_name, and target_resource are required")

    resp = process_tool_call(
        db=db,
        agent_id=agent_id,
        tool_name=tool_name,
        operation_type=operation_type,
        target_resource=target_resource,
        resource_sensitivity=payload.get("resource_sensitivity", "low"),
        action_parameters=payload.get("action_parameters", {}),
        task_id=payload.get("task_id"),
        initiating_user=payload.get("initiating_user", "api_client"),
        session_id=payload.get("session_id", "sess_001"),
        parent_agent_id=payload.get("parent_agent_id"),
        data_volume=payload.get("data_volume", 1),
        destination=payload.get("destination"),
        input_provenance=payload.get("input_provenance"),
        configuration_changes=payload.get("configuration_changes")
    )

    return resp.to_dict()

# --- One-Command Seed & Scenarios ---
@router.post("/seed")
def seed_endpoint(db: Session = Depends(get_db)):
    seed_registry(db)
    return {"status": "success", "message": "Registry and default tasks seeded"}

@router.post("/scenarios/run")
def run_scenarios_endpoint(db: Session = Depends(get_db)):
    results = run_all_scenarios(db)
    return {"status": "success", "results": results}

@router.get("/scenarios/list")
def list_scenarios():
    return SCENARIO_DEFINITIONS
