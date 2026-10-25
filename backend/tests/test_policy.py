import pytest
from sigil.models import AgentModel, TaskModel
from sigil.policy import evaluate_hard_policies

@pytest.fixture
def sample_agents():
    research_agent = AgentModel(
        agent_id="agent_research_01",
        name="Research Agent",
        owner="Research department",
        role="Research assistant",
        purpose="Search approved sources and summarize findings",
        allowed_tools=["web_search", "approved_document_reader", "text_summarizer"],
        restricted_tools=["payment_api", "payroll_export", "admin_console"],
        data_scope=["public_documents", "approved_internal_research_documents"],
        permitted_actions=["read", "search", "summarize"],
        restricted_actions=["bulk_export", "modify_permissions", "issue_payment"],
        task_scope="Quantum AI Security Survey",
        risk_profile="Low",
        policy_version="1.2",
        expiry_or_review_date="2026-12-31",
        status="active"
    )
    
    finance_agent = AgentModel(
        agent_id="agent_finance_01",
        name="Finance Agent",
        owner="Finance department",
        role="Finance analyst",
        purpose="Read invoices and prepare payment recommendations",
        allowed_tools=["invoice_reader", "vendor_registry", "payment_recommender"],
        restricted_tools=["admin_console", "payroll_export"],
        data_scope=["invoices", "approved_vendor_records"],
        permitted_actions=["read", "validate", "recommend_payment"],
        restricted_actions=["bulk_export", "modify_permissions"],
        task_scope="Invoice audit",
        risk_profile="Medium",
        policy_version="1.1",
        expiry_or_review_date="2026-12-31",
        status="active"
    )

    support_agent = AgentModel(
        agent_id="agent_support_01",
        name="Customer Support Agent",
        owner="Customer Operations",
        role="Support representative",
        purpose="Retrieve customer details and process eligible refunds",
        allowed_tools=["customer_db_reader", "refund_processor"],
        restricted_tools=["payroll_database", "admin_console"],
        data_scope=["customer_profile", "order_history"],
        permitted_actions=["read", "search", "issue_refund"],
        restricted_actions=["bulk_export", "modify_permissions"],
        task_scope="Customer ticket resolution",
        risk_profile="Medium",
        policy_version="1.0",
        expiry_or_review_date="2026-12-31",
        status="active"
    )

    return {
        "research": research_agent,
        "finance": finance_agent,
        "support": support_agent
    }

def test_research_agent_allowed_action(sample_agents):
    agent = sample_agents["research"]
    task = TaskModel(
        task_id="t1",
        agent_id=agent.agent_id,
        title="Survey",
        description="Public survey",
        authorized_scope=["public_documents", "approved_internal_research_documents"],
        approved_destinations=["internal_notes_system"],
        max_data_volume=20
    )
    res = evaluate_hard_policies(
        agent=agent,
        task=task,
        tool_name="approved_document_reader",
        operation_type="read",
        target_resource="approved_internal_research_documents/paper.pdf",
        data_volume=1,
        destination="internal_notes_system"
    )
    assert not res.is_hard_violation
    assert not res.requires_approval
    assert res.policy_status == "allowed"

def test_research_agent_prohibited_payroll_access(sample_agents):
    agent = sample_agents["research"]
    task = TaskModel(
        task_id="t1",
        agent_id=agent.agent_id,
        title="Survey",
        description="Public survey",
        authorized_scope=["public_documents", "approved_internal_research_documents"],
        approved_destinations=["internal_notes_system"],
        max_data_volume=20
    )
    res = evaluate_hard_policies(
        agent=agent,
        task=task,
        tool_name="payroll_export",  # Prohibited tool
        operation_type="read",
        target_resource="payroll_database/salaries.csv",  # Prohibited resource
        data_volume=1
    )
    assert res.is_hard_violation
    assert res.policy_status == "prohibited"
    assert any("RESTRICTED" in r for r in res.violated_rules)

def test_support_agent_refund_approval_threshold(sample_agents):
    agent = sample_agents["support"]
    task = TaskModel(
        task_id="t2",
        agent_id=agent.agent_id,
        title="Ticket",
        description="Support refund",
        authorized_scope=["order_history"],
        approved_destinations=["support_ticket_system"],
        max_data_volume=5
    )
    # Refund > $150 triggers approval hold
    res = evaluate_hard_policies(
        agent=agent,
        task=task,
        tool_name="refund_processor",
        operation_type="issue_refund",
        target_resource="order_history/order_99.json",
        data_volume=1,
        action_parameters={"amount": 250.0}
    )
    assert not res.is_hard_violation
    assert res.requires_approval
    assert "exceeds standard support limit" in res.approval_reason
