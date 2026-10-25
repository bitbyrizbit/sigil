from sqlalchemy.orm import Session
from sigil.models import AgentModel, TaskModel

DEFAULT_AGENTS = [
    {
        "agent_id": "agent_research_01",
        "name": "Research Agent",
        "owner": "Research department",
        "role": "Research assistant",
        "purpose": "Search approved sources and summarize findings",
        "allowed_tools": ["web_search", "approved_document_reader", "text_summarizer"],
        "restricted_tools": ["payment_api", "payroll_export", "admin_console", "database_manager", "email_client"],
        "data_scope": ["public_documents", "approved_internal_research_documents", "academic_papers"],
        "permitted_actions": ["read", "search", "summarize"],
        "restricted_actions": ["bulk_export", "modify_permissions", "send_confidential_data_externally", "write_database", "issue_payment"],
        "task_scope": "Current research assignment: public quantum and AI security research only",
        "risk_profile": "Low-risk reading; approval required for sensitive writes",
        "policy_version": "1.2",
        "expiry_or_review_date": "2026-12-31",
        "status": "active"
    },
    {
        "agent_id": "agent_finance_01",
        "name": "Finance Agent",
        "owner": "Finance department",
        "role": "Finance analyst",
        "purpose": "Read invoices and prepare payment recommendations",
        "allowed_tools": ["invoice_reader", "vendor_registry", "payment_recommender", "accounting_ledger_reader"],
        "restricted_tools": ["admin_console", "payroll_export", "customer_records_exporter", "unrestricted_external_transfer"],
        "data_scope": ["invoices", "approved_vendor_records", "payment_drafts"],
        "permitted_actions": ["read", "validate", "recommend_payment", "calculate_totals"],
        "restricted_actions": ["bulk_export", "modify_permissions", "external_transfer", "direct_payout_without_approval"],
        "task_scope": "Invoice analysis and verification within assigned vendor thresholds",
        "risk_profile": "Medium-risk financial data; approval required for transactions > $5,000 or new vendors",
        "policy_version": "1.1",
        "expiry_or_review_date": "2026-12-31",
        "status": "active"
    },
    {
        "agent_id": "agent_support_01",
        "name": "Customer Support Agent",
        "owner": "Customer Operations",
        "role": "Support representative",
        "purpose": "Retrieve customer details and process eligible refunds",
        "allowed_tools": ["customer_db_reader", "order_status_checker", "refund_processor", "support_ticket_manager"],
        "restricted_tools": ["payroll_database", "admin_console", "bulk_data_exporter", "source_code_repo"],
        "data_scope": ["customer_profile", "order_history", "support_tickets", "refund_guidelines"],
        "permitted_actions": ["read", "search", "update_ticket", "issue_refund"],
        "restricted_actions": ["bulk_export", "modify_permissions", "access_other_departments", "issue_refund_over_threshold"],
        "task_scope": "Resolving assigned customer support tickets and standard customer refunds",
        "risk_profile": "Medium-risk PII; approval required for bulk queries (>10 records) or refunds > $150",
        "policy_version": "1.0",
        "expiry_or_review_date": "2026-12-31",
        "status": "active"
    }
]

DEFAULT_TASKS = [
    {
        "task_id": "task_research_01",
        "agent_id": "agent_research_01",
        "initiating_user": "user_dr_elena",
        "parent_agent_id": None,
        "title": "Quantum AI Security Literature Survey",
        "description": "Synthesize publicly accessible academic papers on post-quantum lattice cryptography and AI safety.",
        "authorized_scope": ["public_documents", "approved_internal_research_documents", "academic_papers"],
        "approved_destinations": ["internal_notes_system", "summary_vault"],
        "max_data_volume": 20,
        "status": "in_progress"
    },
    {
        "task_id": "task_finance_01",
        "agent_id": "agent_finance_01",
        "initiating_user": "user_marcus_cfo",
        "parent_agent_id": None,
        "title": "Q3 Vendor Invoice Audit",
        "description": "Cross-reference approved vendor invoices for server compute hosting against monthly purchase orders.",
        "authorized_scope": ["invoices", "approved_vendor_records"],
        "approved_destinations": ["finance_reporting_portal"],
        "max_data_volume": 100,
        "status": "in_progress"
    },
    {
        "task_id": "task_support_01",
        "agent_id": "agent_support_01",
        "initiating_user": "user_sarah_lead",
        "parent_agent_id": None,
        "title": "Resolve Ticket #8492 Billing Inquiry",
        "description": "Review single customer order history and issue appropriate replacement credit under $50.",
        "authorized_scope": ["customer_profile", "order_history"],
        "approved_destinations": ["support_ticket_system"],
        "max_data_volume": 5,
        "status": "in_progress"
    }
]

def seed_registry(db: Session):
    for agent_data in DEFAULT_AGENTS:
        existing = db.query(AgentModel).filter(AgentModel.agent_id == agent_data["agent_id"]).first()
        if not existing:
            agent = AgentModel(**agent_data)
            db.add(agent)
        else:
            for k, v in agent_data.items():
                setattr(existing, k, v)
    
    for task_data in DEFAULT_TASKS:
        existing_task = db.query(TaskModel).filter(TaskModel.task_id == task_data["task_id"]).first()
        if not existing_task:
            task = TaskModel(**task_data)
            db.add(task)
        else:
            for k, v in task_data.items():
                setattr(existing_task, k, v)
    
    db.commit()

def get_agent(db: Session, agent_id: str) -> AgentModel | None:
    return db.query(AgentModel).filter(AgentModel.agent_id == agent_id).first()

def get_all_agents(db: Session) -> list[AgentModel]:
    return db.query(AgentModel).all()

def update_agent_status(db: Session, agent_id: str, new_status: str) -> AgentModel | None:
    agent = get_agent(db, agent_id)
    if agent:
        agent.status = new_status
        db.commit()
        db.refresh(agent)
    return agent
