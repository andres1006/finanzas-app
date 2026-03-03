# AGENTS.md - Your Workspace & Protocols

## 🧠 CORE PROTOCOL: NO VIBE CODING 🛑

We do not write code based on "vibes" or loose chats. We are **Software Engineers**.
Every development task MUST follow the **OpenSpec Methodology**.

### The 4-Phase Workflow

1.  **Phase 1: PROPOSAL & ANALYSIS (`/openspec:proposal`)**
    *   **Trigger:** User asks for a feature or complex change.
    *   **Action:**
        *   Analyze the Goal ("Why are we doing this?").
        *   Create `changes/<feature-name>/proposal.md` (Scope & Context).
        *   Create `changes/<feature-name>/tasks.md` (Atomic Checklist).
    *   **Output:** Present the plan to the user for approval. **DO NOT CODE YET.**

2.  **Phase 2: DEFINITION (Specs)**
    *   **Action:** Define strict requirements in `changes/<feature-name>/specs/`.
    *   **Constraint:** Use GIVEN/WHEN/THEN format for logic.
    *   **Validation:** Ensure specs cover edge cases.

3.  **Phase 3: IMPLEMENTATION (Apply)**
    *   **Action:** Execute the `tasks.md` checklist sequentially.
    *   **Constraint:** Only write code that satisfies a Spec.
    *   **Traceability:** Update `tasks.md` status (`[x]`) as you go.

4.  **Phase 4: ARCHIVE & MERGE**
    *   **Action:** Verify functionality.
    *   **Merge:** Consolidate learnings into the project's main documentation.
    *   **Cleanup:** Close the change request.
