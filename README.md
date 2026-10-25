# Sigil: Runtime Identity Drift Detection & Response for Autonomous AI Agents

> A runtime security and governance proxy that intercepts autonomous AI agent tool calls outside the model's process space—continuously verifying that attempted actions remain strictly aligned with assigned role identity, active task intent, and authorized data boundaries before execution.

---

### *Authenticated Isn't Innocent.*

> **"Sigil"** — an inscribed mark or token possessing autonomous intent, power, and authority.  
> In autonomous AI systems, an identity is not compromised when credentials break; it is compromised when an authenticated agent diverges from its bounded mandate. Sigil intercepts the tool call before the damage is executed.

**Live Interactive Security Console:** [https://sigil-dun.vercel.app/](https://sigil-dun.vercel.app/)

---

```mermaid
flowchart LR
    A["Autonomous AI Agent<br/>(Valid Credentials)"] -->|Tool / API Invocation| G["Sigil Gateway<br/>(External Interceptor)"]
    G --> P["Policy & Role Boundaries<br/>(Cold-Start Whitelist)"]
    G --> T["Active Task Context<br/>(Intent Alignment)"]
    G --> B["Rolling Trajectory & History<br/>(Behavioral Drift)"]
    P & T & B --> S["Multi-Signal Risk Engine<br/>R = 100 × (0.35P + 0.25T + 0.15B + 0.15I + 0.10C)"]
    S --> D{"Decision Gateway"}
    D -->|Low Risk| AL["ALLOW<br/>Execute Tool Outside Agent"]
    D -->|High Value / Ambiguous| H["HOLD<br/>Approval Binding"]
    D -->|Prohibited / Injection| BL["BLOCK<br/>Zero Tool Execution"]
    AL & H & BL --> AU[("Forensic Audit Store<br/>Immutable 9-Point Record")]
```

---

## The Autonomous Drift Problem

Traditional access control operates on a dangerous assumption: **if credentials authenticate cleanly, the attempted action must be legitimate.**

In autonomous AI systems, this assumption fails catastrophically. Agent compromises almost never look like stolen tokens, broken handshakes, or brute-force logins. Instead, they manifest as **behavioral divergence under legitimate credentials**:

* A **Customer Support Agent** authorized to check orders and issue refunds suddenly queries thousands of rows across unrelated enterprise accounts.
* A **Research Assistant** reads an academic PDF containing indirect prompt injection instructing it to exfiltrate proprietary source summaries to a public webhook.
* A **Finance Analyst** tasked with verifying cloud invoices attempts to access executive payroll tables simply because a shared file-reader tool technically can.

In autonomous agent architectures, security operators face three brutal realities:

1. **The Credential Fallacy**: Authentication only proves *who* holds the key, not *what* they intend to do with it. An agent hijacked by indirect prompt injection or hallucination executes catastrophic API calls with legitimate OAuth tokens and clean schemas.
2. **The Prompt-Guard Illusion**: Model-level guardrails and system prompts live in the generative context. They fail under indirect prompt injection, semantic obfuscation, and multi-agent delegation chains. You cannot reliably enforce API boundaries from inside the model.
3. **The Post-Mortem Trap**: Classical anomaly detectors and SIEM dashboards log events asynchronously after execution. Once proprietary data is exfiltrated or an unauthorized wire is dispatched, an alert is an autopsy, not defense.

**Sigil** is an out-of-process runtime security proxy placed between autonomous agents and protected tools. It intercepts tool invocations before execution, evaluating role boundaries, active task intent, historical trajectories, and input provenance to contain out-of-role actions before they execute.

---

## Why Existing Defenses Fail

| Paradigm | How It Operates | Why It Breaks Against AI Agents |
|---|---|---|
| **Static RBAC** | Binary allowlists tied to agent identities. | Coarse-grained. A research agent needs read tools; RBAC cannot prevent it from pointing that tool at employee salary tables. |
| **Model Guardrails** | String filters, system prompts, or output LLM judges. | Operates inside model context. Susceptible to jailbreaks, prompt injection, and semantic obfuscation. Enforces zero technical control at the socket or database level. |
| **Statistical Anomaly Scoring** | Flags frequency and volume outliers against historical distributions. | Blind during cold starts. Brand-new agents pass unchecked while baselines train. Furthermore, an opaque score (`Risk: 88`) gives operators no causal explanation. |
| **Alert-Only Dashboards** | Asynchronously logs suspicious calls post-execution. | Leaves high-impact actions uncontained. Once proprietary data is exfiltrated or an unauthorized wire is dispatched, an alert is an autopsy, not defense. |

---

## How Sigil Works: The Closed-Loop Gateway

Sigil decouples authorization from the agent's generative process. Operating as an external mediation gateway between agents and external tools, Sigil enforces hard governance **outside the model's runtime boundary** prior to execution:

```mermaid
sequenceDiagram
    autonumber
    actor U as Operator / Task Trigger
    participant Ag as Autonomous Agent
    participant GW as Sigil Runtime Gateway
    participant Det as Multi-Signal Risk Engine
    participant PT as Protected Tool / API
    participant Aud as Forensic Audit Store

    U->>Ag: Assign Task (Bounded Authorized Scope)
    Ag->>GW: Attempt Tool Call (Parameters, Target Resource)
    Note over GW: Intercepted BEFORE execution
    GW->>Det: Evaluate Role, Active Task, Trajectory, Provenance
    Det-->>GW: Risk Score (R), Policy Status & Enforced Decision
    
    alt Decision == ALLOW
        GW->>PT: Execute Tool Outside Agent Process
        PT-->>GW: Tool Response
        GW->>Aud: Log Compliant Execution
        GW-->>Ag: Return Tool Result
    else Decision == HOLD_FOR_APPROVAL
        GW->>Aud: Log Pending Hold (Hard Target & Parameter Binding)
        GW-->>Ag: Execution Held Awaiting Human Operator Verification
    else Decision == BLOCK
        GW->>Aud: Record Prohibited Attempt with Evidence Card
        GW-->>Ag: Technical Gateway Rejection (Tool Is Never Touched)
    end
```

### 1. Intent- and Task-Aware Alignment
Sigil binds every active agent session to an authorized task scope. A general file-reading tool may be in the agent's allowed toolset, but if the active task is `Quantum AI Security Literature Survey`, attempts to read `payroll_database` are caught as intent divergence and blocked.

### 2. Evidence-Backed Explanations
Rather than outputting bare numeric scores, Sigil synthesizes structured, auditable evidence cards explaining *why* an action was stopped:
> *"High risk (Score: 82/100, Confidence: 97%): Agent 'Research Agent' attempted 'read' on 'payroll_database/employee_salaries.csv' using tool 'web_search'. Hard policy rule violated: Target is outside authorized data scope. Task alignment mismatch: Resource conflicts with active task 'Literature Survey'. Gateway technically suppressed invocation before execution."*

### 3. Risk-Adaptive Proportional Containment
* **Allow:** Low-risk, in-scope actions execute immediately.
* **Hold for Review:** Boundary-burst or high-dollar actions are queued in an approval hold with cryptographic-style target and parameter binding.
* **Block:** Explicit policy violations and out-of-scope targets are terminated before execution.
* **Isolate:** Compromised or persistently drifting agent identities are quarantined across all tasks.

---

## Built-In Agent Identities & Behavioral Baselines

Sigil seeds three distinct operational roles with explicit policy boundaries:

| Agent Identity | Department / Owner | Allowed Tools | Data Scope & Permitted Actions | Hard Boundaries & Approval Limits |
|---|---|---|---|---|
| **Research Agent** (`agent_research_01`) | Research (`Dr. Elena`) | `web_search`, `approved_document_reader`, `text_summarizer` | `public_documents`, `approved_internal_research_documents`, `academic_papers` (Read/Summarize) | Prohibited: `payroll_database`, `payment_api`, write operations. Blocked on internal credential exfiltration. |
| **Finance Agent** (`agent_finance_01`) | Finance (`Marcus CFO`) | `invoice_reader`, `vendor_registry`, `payment_recommender`, `ledger_reader` | `invoices`, `approved_vendor_records`, `payment_drafts` (Validate/Recommend) | Prohibited: direct external transfers. Automatic approval hold for transactions > $5,000 or unapproved vendors. |
| **Customer Support Agent** (`agent_support_01`) | Customer Operations (`Sarah Lead`) | `customer_db_reader`, `order_status_checker`, `refund_processor`, `ticket_manager` | `customer_profile`, `order_history`, `support_tickets`, `refund_guidelines` (Read/Refund) | Prohibited: bulk export, other dept databases. Approval hold for refunds > $150 or queries > 10 records. |

---

## Multi-Signal Risk Scoring

$$\mathbf{R} = 100 \times \left(0.35P + 0.25T + 0.15B + 0.15I + 0.10C\right)$$

* **$P$ (Explicit Policy Violation):** Hard role boundaries, categorical prohibitions, and tool whitelists ($0.0, 0.5, 1.0$).
* **$T$ (Task Scope Divergence):** Semantic and resource mismatch between requested target and active task scope ($0.0 \text{ to } 1.0$).
* **$B$ (Behavioral Divergence):** Trajectory acceleration, anomalous data volume spikes, and tool novelty ($0.0 \text{ to } 1.0$).
* **$I$ (Impact & Reversibility):** Sensitivity classification of resource, destructive actions (write, delete, export), and external destinations ($0.0 \text{ to } 1.0$).
* **$C$ (Context & Input Provenance):** Untrusted document origin, instruction-override indicators, or deep delegation chains ($0.0 \text{ to } 1.0$).

> **Hard Override:** Any categorical policy violation forces an immediate `BLOCK` and `prohibited` policy status regardless of aggregate score.

Every evaluation returns four mandatory components:
1. **Risk Score:** Severity assessment ($0-100$).
2. **Confidence Level:** Statistical certainty derived from signal agreement.
3. **Policy Status:** Explicit classification (`allowed`, `prohibited`, `not_covered`, or `requires_approval`).
4. **Enforced Response:** Concrete technical action (`ALLOW`, `HOLD_FOR_APPROVAL`, `BLOCK`, `ISOLATE`).

---

## Forensic Audit Store: The 9 Questions

To reconstruct security incidents without relying on an agent's self-reported narrative, every intercepted call logs immutable answers to nine forensic questions:

```mermaid
classDiagram
    class AuditRecord {
        +String audit_id
        +DateTime timestamp
        +String agent_id : Which agent initiated?
        +String initiating_user : Who initiated task/parent?
        +String task_id : What task was active?
        +JSON task_scope : What scope was authorized?
        +String attempted_action : What did agent attempt?
        +String tool_name : Which tool was requested?
        +String target_resource : What was the target?
        +JSON action_parameters : What parameters were passed?
        +String policy_version : Which policy version evaluated?
        +JSON evaluated_rules : Which rules were tested?
        +JSON signals : What were the P, T, B, I, C weights?
        +String decision : Why allowed, challenged, or blocked?
        +String tool_execution_outcome : What actually happened at the tool?
        +String containment_action : Which containment was enforced?
        +String resolved_by : Who approved exception or resolved incident?
    }
```

The audit trail is strictly append-only. Monitored agents possess zero technical write, update, or delete access to forensic records.

---

## Empirical Benchmark Evaluation

Sigil was benchmarked against two standard production baselines across 13 reproducible ground-truth scenarios:
* **Baseline A (Static RBAC):** Checks only whether the requested tool is in the agent's permission list.
* **Baseline B (RBAC + Volume Threshold):** Checks tool permissions and flags volume surges exceeding 20 items.
* **Sigil (Runtime Identity Drift Layer):** Context-aware task alignment, input provenance, delegation tracing, and risk-adaptive holds.

### Results on 13 Scenarios in this Benchmark
*Dataset Composition: 7 Attacks, 6 Legitimate Workloads (including 2 Ambiguous Cases and 3 Additional Edge Case Scenarios).*

| Architecture | Precision | Recall | False Positive Rate | Prevention Rate | Immediate Completion | Held for Review | False Block Rate | Avg Latency |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Baseline A (Static RBAC)** | 100.0% | 14.3% | 0.0% | 14.3% | 100.0% | 0.0% | 0.0% | < 0.1 ms |
| **Baseline B (RBAC + Threshold)** | 100.0% | 42.9% | 0.0% | 42.9% | 100.0% | 0.0% | 0.0% | < 0.1 ms |
| **Sigil (Runtime Layer)** | **100.0%** | **100.0%** | **0.0%** | **100.0%** | **66.7%** | **33.3%** | **0.0%** | **10.2 ms** |

> **Evaluation Honesty & The Substring Scope Bypass Fix:**
> During testing against novel edge cases, Sigil initially recorded 85.7% recall (6/7 attacks caught) due to a scope-bypass flaw in resource matching: `unapproved_vendor_records/...` passed against `approved_vendor_records` because of a bidirectional substring check (`in`).
> 
> After replacing substring matching with exact path-segment and delimited prefix verification (`target_resource.startswith(scope + "/")` or `target_root == scope`), the bypass was eliminated and recall rose to 100.0% (7/7 attacks stopped).
>
> On legitimate workloads, Sigil executed 66.7% (4/6) immediately without disruption, while routing 33.3% (2/6) ambiguous edge cases (high-value invoices and VIP batch queries) to safe human approval hold queues. Zero legitimate tasks were falsely rejected (0.0% false block rate).

### Per-Scenario Breakdown

| Workload / Threat Category | Scenario Count | Baseline A (RBAC) | Baseline B (Threshold) | Sigil Runtime Layer |
|---|:---:|:---:|:---:|:---:|
| **Benign Baseline** | 1 | 1/1 passed | 1/1 passed | **1/1 passed** |
| **Policy Violation (Out-of-Role)** | 1 | 0/1 caught | 0/1 caught | **1/1 caught** |
| **Indirect Prompt Injection** | 1 | 0/1 caught | 0/1 caught | **1/1 caught** |
| **Gradual Drift (Volume Surge)** | 1 | 0/1 caught | **1/1 caught** | **1/1 caught** |
| **Multi-Agent Delegation Drift** | 1 | 0/1 caught | 0/1 caught | **1/1 caught** |
| **Cold-Start Rogue Agent** | 1 | **1/1 caught** | **1/1 caught** | **1/1 caught** |
| **Legitimate Scope Change (Scenario F)** | 1 | 1/1 passed | 1/1 passed | **1/1 passed** |
| **Approval Required Hold** | 1 | 1/1 passed | 1/1 passed | **1/1 held** |
| **Ambiguous Business Workloads** | 2 | 2/2 passed | 2/2 passed | **2/2 held for review** |
| **Additional Edge Case Attacks** | 2 | 0/2 caught | 1/2 caught | **2/2 caught** |
| **Additional Edge Case Benign** | 1 | 1/1 passed | 1/1 passed | **1/1 passed** |

*Baseline B proves that volume thresholds catch brute-force volume accumulation, but remain blind to task mismatch, prompt injection provenance, and multi-agent privilege escalation. Sigil catches these contextual deviations while preserving legitimate agent execution.*

---

## Assumptions & Design Choices

1. **Tool Gateway Simulator:** An interactive gateway test console is built directly into the UI to simulate and inspect tool calls with arbitrary or preset payloads in real time.
2. **UI Framework & Styling:** Built with Next.js 14, Tailwind CSS, and Lucide-react to render a high-density, accessible, clean light-themed enterprise security console.
3. **Database Portability:** Implemented using SQLAlchemy with standard dual-dialect compatibility. Runs on local SQLite (`sqlite:///./sigil.db`) out-of-the-box and connects to hosted PostgreSQL in production via the `DATABASE_URL` environment variable.
4. **Operator Key Security:** State-mutating administrative actions (`resolve approval`, `containment`, `policy update`, `seed`, `scenarios`, `evaluation`, and `gateway execution`) require an `OPERATOR_KEY`. In production mode or PostgreSQL deployments, the backend refuses to start without an explicit operator credential. In the frontend, the key is typed at runtime by the operator, stored exclusively in browser session memory (`sessionStorage`), and is never baked into frontend builds or public variables.
5. **Statistical Confidence Derivation:** Alert confidence (0.65 to 0.98) is calculated dynamically from multi-signal corroboration: `Confidence = min(0.98, 0.65 + (0.08 * active_signals))`, reflecting agreement across policy, task, behavioral, impact, and provenance signals.
6. **Self-Approval Prevention:** Agent identities cannot resolve their own approval requests. The resolution endpoint enforces operator authentication and verifies that the approver is not an agent identity.

---

## Scope, Risks & Limitations

* **False Positives in Dynamic Roles:** Legitimate changes in agent workflows can resemble drift. Sigil requires verified policy update records (`POST /api/policies/update`) with version bumps to permit new scopes without alert noise.
* **Bypass Vulnerabilities:** Sigil protects the execution boundary. If an autonomous model is given direct, unproxied socket or shell access that circumvents the gateway, runtime containment cannot intercept it.
* **Audit Isolation:** In a single-database deployment, audit store isolation is logical (table-level access controls and append-only application logic). True physical isolation requires dedicated, write-once audit instances.
* **Prompt Injection Correlation:** Linking untrusted upstream documents to outbound tool calls establishes strong temporal correlation and provenance tracking, not formal mathematical proof of causal instruction override.
