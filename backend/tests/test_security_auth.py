import pytest
from fastapi.testclient import TestClient
from sigil.main import app
from sigil.config import settings
from sigil.policy import match_resource_scope

client = TestClient(app)

def test_scope_matching_exact_and_prefix():
    scopes = ["invoices", "approved_vendor_records", "customer_profile"]
    
    # 1. Exact matches pass
    assert match_resource_scope("invoices", scopes) is True
    assert match_resource_scope("approved_vendor_records", scopes) is True
    
    # 2. Valid child path under allowed directory passes
    assert match_resource_scope("invoices/2026_q3_report.pdf", scopes) is True
    assert match_resource_scope("approved_vendor_records/acme_corp_details", scopes) is True
    assert match_resource_scope("customer_profile/user_102", scopes) is True
    
    # 3. Substring evasion attack MUST FAIL
    # "unapproved_vendor_records" contains "approved_vendor_records" as a substring,
    # but represents an unvetted/unauthorized vendor domain
    assert match_resource_scope("unapproved_vendor_records", scopes) is False
    assert match_resource_scope("unapproved_vendor_records/shell_corp_invoice", scopes) is False
    assert match_resource_scope("fake_invoices/bill.pdf", scopes) is False
    assert match_resource_scope("customer_profile_exfil", scopes) is False

def test_read_only_endpoints_accessible_without_key():
    """Dashboard read-only visibility requires no authentication for demo observers."""
    endpoints = [
        "/api/dashboard/summary",
        "/api/agents",
        "/api/events",
        "/api/alerts",
        "/api/timeline",
        "/api/policies",
        "/api/approvals",
        "/api/evaluation",
        "/api/scenarios/list"
    ]
    for ep in endpoints:
        resp = client.get(ep)
        assert resp.status_code == 200, f"Expected 200 for {ep}, got {resp.status_code}"

def test_mutation_endpoints_reject_missing_operator_key():
    """All administrative, execution, containment, and scenario mutation endpoints return 401 when key is missing."""
    protected_endpoints = [
        ("POST", "/api/seed", None),
        ("POST", "/api/scenarios/run", None),
        ("POST", "/api/evaluation/run", None),
        ("POST", "/api/gateway/execute", {"agent_id": "agent_finance_01", "tool_name": "invoice_reader", "target_resource": "invoices/test.pdf"}),
        ("POST", "/api/approvals/resolve", {"approval_id": "app_test", "action": "APPROVE"}),
        ("POST", "/api/containment/status", {"agent_id": "agent_finance_01", "action": "PAUSE"}),
        ("POST", "/api/policies/update", {"agent_id": "agent_finance_01", "allowed_tools": ["invoice_reader"]}),
        ("POST", "/api/alerts/alert_test/resolve", {"status": "RESOLVED"})
    ]

    for method, ep, body in protected_endpoints:
        # Request without header
        resp = client.post(ep, json=body or {})
        assert resp.status_code == 401, f"Expected 401 for unauthenticated {ep}, got {resp.status_code}: {resp.text}"

        # Request with invalid header
        resp_invalid = client.post(ep, json=body or {}, headers={"X-Operator-Key": "invalid-wrong-secret"})
        assert resp_invalid.status_code == 401, f"Expected 401 for invalid key on {ep}, got {resp_invalid.status_code}"

def test_mutation_endpoints_succeed_with_valid_key():
    """Protected endpoints succeed when valid X-Operator-Key header is supplied."""
    valid_headers = {"X-Operator-Key": settings.OPERATOR_KEY}
    
    # 1. Test Seed
    seed_resp = client.post("/api/seed", headers=valid_headers)
    assert seed_resp.status_code == 200
    assert seed_resp.json()["status"] == "success"

    # 2. Test Gateway execution
    gw_payload = {
        "agent_id": "agent_research_01",
        "tool_name": "approved_document_reader",
        "operation_type": "read",
        "target_resource": "approved_internal_research_documents/quantum_paper.pdf",
        "task_id": "task_research_01"
    }
    gw_resp = client.post("/api/gateway/execute", json=gw_payload, headers=valid_headers)
    assert gw_resp.status_code == 200
    assert gw_resp.json()["decision"] == "ALLOW"
