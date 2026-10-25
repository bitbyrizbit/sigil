import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sigil.db import Base
from sigil.models import AgentModel, TaskModel, AuditRecordModel, EventModel, ApprovalModel
from sigil.registry import seed_registry
from sigil.gateway import process_tool_call
from sigil.containment import resolve_approval, update_agent_containment

@pytest.fixture
def db_session():
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    seed_registry(session)
    yield session
    session.close()

def test_gateway_allow_executes_tool(db_session):
    resp = process_tool_call(
        db=db_session,
        agent_id="agent_research_01",
        tool_name="approved_document_reader",
        operation_type="read",
        target_resource="approved_internal_research_documents/quantum_lattice_01.pdf",
        task_id="task_research_01",
        data_volume=1,
        destination="internal_notes_system"
    )
    assert resp.decision == "ALLOW"
    assert resp.execution_status == "executed"
    assert resp.tool_output is not None
    assert "Verified documentation payload" in resp.tool_output.get("content", "")

def test_gateway_block_prevents_tool_execution(db_session):
    resp = process_tool_call(
        db=db_session,
        agent_id="agent_research_01",
        tool_name="web_search",
        operation_type="read",
        target_resource="payroll_database/executive_salaries.csv",
        task_id="task_research_01"
    )
    assert resp.decision == "BLOCK"
    assert resp.execution_status == "blocked"
    assert resp.tool_output is None
    assert resp.alert_id is not None
    assert "high risk" in resp.explanation.lower() or "critical risk" in resp.explanation.lower()

    # Verify audit record answers the questions
    audit = db_session.query(AuditRecordModel).order_by(AuditRecordModel.timestamp.desc()).first()
    assert audit is not None
    assert audit.agent_id == "agent_research_01"
    assert audit.decision == "BLOCK"
    assert "PREVENTED before execution" in audit.tool_execution_outcome

def test_hold_until_approval_flow(db_session):
    # Support agent issues $200 refund (> $150 limit)
    resp = process_tool_call(
        db=db_session,
        agent_id="agent_support_01",
        tool_name="refund_processor",
        operation_type="issue_refund",
        target_resource="order_history/refund_ticket_991",
        action_parameters={"amount": 200.0},
        task_id="task_support_01"
    )
    assert resp.decision == "HOLD_FOR_APPROVAL"
    assert resp.execution_status == "held"
    assert resp.tool_output is None
    assert resp.approval_id is not None

    # Check approval record in db
    approval = db_session.query(ApprovalModel).filter(ApprovalModel.approval_id == resp.approval_id).first()
    assert approval is not None
    assert approval.status == "PENDING"

    # Test Self-Approval Prevention
    self_appr = resolve_approval(
        db=db_session,
        approval_id=resp.approval_id,
        action="APPROVE",
        resolved_by="agent_support_01",  # Agent attempting to approve itself!
        justification="I am approving my own refund"
    )
    assert self_appr["status"] == "error"
    assert "Security violation" in self_appr["message"]

    # Test Hard Binding Target Mismatch
    mismatch_appr = resolve_approval(
        db=db_session,
        approval_id=resp.approval_id,
        action="APPROVE",
        resolved_by="lead_supervisor",
        verify_target="unauthorized_tampered_target_resource"
    )
    assert mismatch_appr["status"] == "error"
    assert "Security binding mismatch" in mismatch_appr["message"]

    # Resolve approval by authorized human supervisor
    res = resolve_approval(
        db=db_session,
        approval_id=resp.approval_id,
        action="APPROVE",
        resolved_by="lead_supervisor",
        justification="Verified customer exception approved",
        verify_target="order_history/refund_ticket_991"
    )
    assert res["status"] == "success"
    assert res["new_status"] == "APPROVED"
    assert res["tool_output"] is not None
    assert "credited successfully" in res["tool_output"].get("message", "")

def test_containment_isolation(db_session):
    # Contain agent
    res = update_agent_containment(
        db=db_session,
        agent_id="agent_research_01",
        action="ISOLATE",
        operator="soc_lead",
        reason="Suspected credential compromise"
    )
    assert res["status"] == "success"
    assert res["current_status"] == "isolated"

    # Even a normally allowed action MUST now be blocked immediately
    resp = process_tool_call(
        db=db_session,
        agent_id="agent_research_01",
        tool_name="approved_document_reader",
        operation_type="read",
        target_resource="approved_internal_research_documents/quantum_lattice_01.pdf",
        task_id="task_research_01"
    )
    assert resp.decision == "BLOCK"
    assert "ISOLATED" in resp.explanation
