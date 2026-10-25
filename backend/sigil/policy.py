from typing import Any
from sigil.models import AgentModel, TaskModel

class PolicyEvaluationResult:
    def __init__(
        self,
        is_hard_violation: bool = False,
        requires_approval: bool = False,
        violated_rules: list[str] = None,
        approval_reason: str | None = None,
        policy_status: str = "allowed"  # "allowed", "prohibited", "not_covered", "requires_approval"
    ):
        self.is_hard_violation = is_hard_violation
        self.requires_approval = requires_approval
        self.violated_rules = violated_rules or []
        self.approval_reason = approval_reason
        self.policy_status = policy_status

    def to_dict(self):
        return {
            "is_hard_violation": self.is_hard_violation,
            "requires_approval": self.requires_approval,
            "violated_rules": self.violated_rules,
            "approval_reason": self.approval_reason,
            "policy_status": self.policy_status
        }

def match_resource_scope(target: str, scopes: list[str]) -> bool:
    """
    Evaluates whether target_resource falls within authorized scope entries.
    Matches exact tokens, directory paths (prefix with '/' delimiter), or root path segments.
    Prevents substring evasion flaws (e.g. 'unapproved_vendor_records' matching 'approved_vendor_records').
    """
    if not scopes or not target:
        return False
    norm_target = target.strip().lower()
    target_segments = [s for s in norm_target.split("/") if s]
    target_root = target_segments[0] if target_segments else norm_target

    for scope in scopes:
        norm_scope = scope.strip().lower()
        if not norm_scope:
            continue
        # Exact match
        if norm_target == norm_scope:
            return True
        # Exact directory path prefix with delimiter
        if norm_target.startswith(norm_scope + "/"):
            return True
        # Target root segment matches scope token exactly
        if target_root == norm_scope:
            return True
        # Scope is a sub-path within target with delimiter
        if norm_scope.startswith(norm_target + "/"):
            return True
    return False

def evaluate_hard_policies(
    agent: AgentModel,
    task: TaskModel | None,
    tool_name: str,
    operation_type: str,
    target_resource: str,
    data_volume: int = 1,
    destination: str | None = None,
    action_parameters: dict[str, Any] | None = None
) -> PolicyEvaluationResult:
    """
    Module 3: Deterministic policy checks.
    Evaluates explicit rules and boundary constraints.
    Works from the very first action (Cold-Start Protection).
    """
    violated_rules = []
    requires_approval = False
    approval_reasons = []

    # 1. Agent status check (if paused or isolated, block all tool calls)
    if agent.status == "isolated":
        violated_rules.append(f"Agent {agent.agent_id} is ISOLATED by security containment. All actions blocked.")
        return PolicyEvaluationResult(is_hard_violation=True, violated_rules=violated_rules, policy_status="prohibited")

    if agent.status == "paused":
        violated_rules.append(f"Agent {agent.agent_id} is PAUSED by administrator. Actions held.")
        return PolicyEvaluationResult(is_hard_violation=False, requires_approval=True, approval_reason="Agent execution paused for review", policy_status="requires_approval")

    # 2. Explicit restricted tools check
    restricted_tools = agent.restricted_tools or []
    if tool_name in restricted_tools:
        violated_rules.append(f"Tool '{tool_name}' is explicitly RESTRICTED for agent role '{agent.role}'")

    # 3. Allowed tools whitelist check
    allowed_tools = agent.allowed_tools or []
    if tool_name not in allowed_tools:
        violated_rules.append(f"Tool '{tool_name}' is not in the allowed tools whitelist {allowed_tools}")

    # 4. Explicit restricted actions
    restricted_actions = agent.restricted_actions or []
    if operation_type in restricted_actions:
        violated_rules.append(f"Operation '{operation_type}' is explicitly restricted for agent role '{agent.role}'")

    # 5. Permitted actions check
    permitted_actions = agent.permitted_actions or []
    if permitted_actions and operation_type not in permitted_actions:
        violated_rules.append(f"Operation '{operation_type}' is outside permitted actions: {permitted_actions}")

    # 6. Data Scope & Resource Boundary (Exact segment & prefix matching)
    allowed_data_scope = agent.data_scope or []
    if not match_resource_scope(target_resource, allowed_data_scope):
        violated_rules.append(f"Resource '{target_resource}' is outside the authorized data scope for this agent")

    # 7. Task Context Scope Check (if task is bound)
    if task:
        task_scope = task.authorized_scope or []
        if not match_resource_scope(target_resource, task_scope):
            violated_rules.append(f"Resource '{target_resource}' conflicts with active task '{task.title}' authorized scope {task_scope}")

        # Check destination if provided
        if destination:
            approved_destinations = task.approved_destinations or []
            if destination not in approved_destinations:
                violated_rules.append(f"Destination '{destination}' is not in approved task destinations {approved_destinations}")

        # Check volume threshold
        if task.max_data_volume and data_volume > task.max_data_volume:
            requires_approval = True
            approval_reasons.append(f"Requested volume ({data_volume}) exceeds task threshold ({task.max_data_volume})")

    # 8. Role-Specific High-Risk Approval Thresholds
    params = action_parameters or {}
    
    # Financial transactions / refunds thresholds
    amount = params.get("amount") or params.get("refund_amount") or params.get("value")
    if amount is not None:
        try:
            amt = float(amount)
            if agent.role == "Support representative" and amt > 150.0:
                requires_approval = True
                approval_reasons.append(f"Refund amount ${amt:.2f} exceeds standard support limit of $150.00")
            elif agent.role == "Finance analyst" and amt > 5000.0:
                requires_approval = True
                approval_reasons.append(f"Payment transaction ${amt:.2f} exceeds pre-approved ceiling of $5,000.00")
        except (ValueError, TypeError):
            pass

    # Support representative bulk query threshold
    if agent.role == "Support representative" and data_volume > 10:
        requires_approval = True
        approval_reasons.append(f"Customer records query of {data_volume} items exceeds single-ticket limit (10)")

    # Hard violations trigger immediate block
    if violated_rules:
        return PolicyEvaluationResult(
            is_hard_violation=True,
            violated_rules=violated_rules,
            policy_status="prohibited"
        )

    # If within policy boundaries but flags sensitive approval
    if requires_approval:
        return PolicyEvaluationResult(
            is_hard_violation=False,
            requires_approval=True,
            approval_reason="; ".join(approval_reasons),
            policy_status="requires_approval"
        )

    # Check if resource or tool is completely unmapped
    all_known_resources = ["public_documents", "approved_internal_research_documents", "academic_papers", "invoices", "approved_vendor_records", "payment_drafts", "customer_profile", "order_history", "support_tickets", "refund_guidelines"]
    if not any(k in target_resource.lower() for k in all_known_resources):
        return PolicyEvaluationResult(
            is_hard_violation=False,
            requires_approval=True,
            approval_reason=f"Resource '{target_resource}' is not covered by standard catalog",
            policy_status="not_covered"
        )

    return PolicyEvaluationResult(
        is_hard_violation=False,
        requires_approval=False,
        policy_status="allowed"
    )
