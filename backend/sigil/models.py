import json
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sigil.db import Base

def utc_now():
    return datetime.now(timezone.utc)

class AgentModel(Base):
    __tablename__ = "agents"

    agent_id = Column(String(100), primary_key=True)
    name = Column(String(100), nullable=False)
    owner = Column(String(100), nullable=False)
    role = Column(String(100), nullable=False)
    purpose = Column(Text, nullable=False)
    allowed_tools = Column(JSON, default=list)
    restricted_tools = Column(JSON, default=list)
    data_scope = Column(JSON, default=list)
    permitted_actions = Column(JSON, default=list)
    restricted_actions = Column(JSON, default=list)
    task_scope = Column(Text, nullable=False)
    risk_profile = Column(String(100), nullable=False)
    policy_version = Column(String(50), default="1.0")
    expiry_or_review_date = Column(String(50), nullable=False)
    status = Column(String(50), default="active")  # active, paused, restricted, isolated
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class TaskModel(Base):
    __tablename__ = "tasks"

    task_id = Column(String(100), primary_key=True)
    agent_id = Column(String(100), ForeignKey("agents.agent_id"), nullable=False)
    initiating_user = Column(String(100), default="user_analyst_01")
    parent_agent_id = Column(String(100), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    authorized_scope = Column(JSON, default=list)
    approved_destinations = Column(JSON, default=list)
    max_data_volume = Column(Integer, default=50)
    created_at = Column(DateTime, default=utc_now)
    status = Column(String(50), default="in_progress")  # in_progress, completed, terminated

class EventModel(Base):
    __tablename__ = "events"

    event_id = Column(String(100), primary_key=True)
    timestamp = Column(DateTime, default=utc_now)
    agent_id = Column(String(100), ForeignKey("agents.agent_id"), nullable=False)
    initiating_user = Column(String(100), default="user_analyst_01")
    session_id = Column(String(100), default="sess_default")
    parent_agent_id = Column(String(100), nullable=True)
    task_id = Column(String(100), nullable=True)
    tool_name = Column(String(100), nullable=False)
    operation_type = Column(String(100), nullable=False)  # read, search, write, export, admin, payment
    target_resource = Column(String(200), nullable=False)
    resource_sensitivity = Column(String(50), default="low")  # low, medium, high, confidential, critical
    action_parameters = Column(JSON, default=dict)
    policy_version = Column(String(50), default="1.0")
    authorization_decision = Column(String(50), nullable=False)  # ALLOW, REVIEW, BLOCK, ISOLATE
    result = Column(String(50), nullable=False)  # allowed, denied, succeeded, failed, pending_approval, blocked
    data_volume = Column(Integer, default=1)
    destination = Column(String(200), nullable=True)
    action_frequency = Column(Float, default=1.0)
    input_provenance = Column(JSON, nullable=True)
    configuration_changes = Column(JSON, nullable=True)
    risk_score = Column(Float, default=0.0)

class AlertModel(Base):
    __tablename__ = "alerts"

    alert_id = Column(String(100), primary_key=True)
    event_id = Column(String(100), ForeignKey("events.event_id"), nullable=False)
    agent_id = Column(String(100), ForeignKey("agents.agent_id"), nullable=False)
    severity = Column(String(50), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    confidence = Column(Float, default=0.9)
    risk_score = Column(Float, default=0.0)
    policy_status = Column(String(50), default="violation")
    recommended_response = Column(String(50), default="BLOCK")
    enforced_response = Column(String(50), default="BLOCK")
    explanation = Column(Text, nullable=False)
    evidence = Column(JSON, default=list)
    signals = Column(JSON, default=dict)
    status = Column(String(50), default="OPEN")  # OPEN, ACKNOWLEDGED, RESOLVED, DISMISSED
    created_at = Column(DateTime, default=utc_now)

class ApprovalModel(Base):
    __tablename__ = "approvals"

    approval_id = Column(String(100), primary_key=True)
    event_id = Column(String(100), ForeignKey("events.event_id"), nullable=False)
    agent_id = Column(String(100), ForeignKey("agents.agent_id"), nullable=False)
    action_summary = Column(Text, nullable=False)
    target_resource = Column(String(200), nullable=False)
    requested_tool = Column(String(100), nullable=False)
    data_volume = Column(Integer, default=1)
    status = Column(String(50), default="PENDING")  # PENDING, APPROVED, REJECTED
    requested_at = Column(DateTime, default=utc_now)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(100), nullable=True)
    justification = Column(Text, nullable=True)

class AuditRecordModel(Base):
    __tablename__ = "audit_records"

    audit_id = Column(String(100), primary_key=True)
    timestamp = Column(DateTime, default=utc_now)
    agent_id = Column(String(100), nullable=False)
    initiating_user = Column(String(100), nullable=False)
    parent_agent_id = Column(String(100), nullable=True)
    task_id = Column(String(100), nullable=True)
    task_scope = Column(JSON, nullable=True)
    attempted_action = Column(String(200), nullable=False)
    tool_name = Column(String(100), nullable=False)
    target_resource = Column(String(200), nullable=False)
    action_parameters = Column(JSON, default=dict)
    policy_version = Column(String(50), default="1.0")
    evaluated_rules = Column(JSON, default=list)
    signals = Column(JSON, default=dict)
    decision = Column(String(50), nullable=False)
    explanation = Column(Text, nullable=False)
    tool_execution_outcome = Column(String(100), nullable=False)
    containment_action = Column(String(100), nullable=False)
    resolved_by = Column(String(100), nullable=True)
    resolution_notes = Column(Text, nullable=True)
