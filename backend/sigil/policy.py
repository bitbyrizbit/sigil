from typing import Any
from sigil.models import AgentModel, TaskModel

class PolicyEvaluationResult:
    def __init__(
        self,
        is_hard_violation: bool = False,
        requires_approval: bool = False,
        violated_rules: list[str] = None,
        approval_reason: str | None = None,
        policy_status: str = "COMPLIANT"
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
        return PolicyEvaluationResult(is_hard_violation=True, violated_rules=violated_rules, policy_status="ISOLATED_BLOCK")

    if agent.status == "paused":
        violated_rules.append(f"Agent {agent.agent_id} is PAUSED by administrator. Actions held.")
        return PolicyEvaluationResult(is_hard_violation=False, requires_approval=True, approval_reason="Agent execution paused for review", policy_status="PAUSED")

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

    # 6. Data Scope & Resource Boundary
    allowed_data_scope = agent.data_scope or []
    resource_matched = False
    # Check if target_resource is matched directly or substring
    for scope in allowed_data_scope:
        if scope.lower() in target_resource.lower() or target_resource.lower() in scope.lower():
            resource_matched = True
            break
    if not resource_matched:
        violated_rules.append(f"Resource '{target_resource}' is outside the authorized data scope for this agent")

    # 7. Task Context Scope Check (if task is bound)
    if task:
        task_scope = task.authorized_scope or []
        task_matched = False
        for s in task_scope:
            if s.lower() in target_resource.lower() or target_resource.lower() in s.lower():
                task_matched = True
                break
        if not task_matched:
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
            policy_status="VIOLATION"
        )

    # If within policy boundaries but flags sensitive approval
    if requires_approval:
        return PolicyEvaluationResult(
            is_hard_violation=False,
            requires_approval=True,
            approval_reason="; ".join(approval_reasons),
            policy_status="REQUIRES_APPROVAL"
        )

    return PolicyEvaluationResult(
        is_hard_violation=False,
        requires_approval=False,
        policy_status="COMPLIANT"
    )
