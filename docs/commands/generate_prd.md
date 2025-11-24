- Read `docs/batches/global_batches.md` and find the specified batch number to extract the feature title and description.
- Auto-generate folder `docs/batches/[batch-no]-[slug]` where `slug` is the feature title lowercased and hyphenated.
- Gather context from: `docs/ai-development-tips.md`, `docs/context/database-schema.md`, `docs/context/user-flow.md`, `.taskmaster/tasks`, and `authesci-app/templates/wowdash/src/html/`.
- Create two files inside the folder: `prd.md` and `review.md`.
- `prd.md` should include: Title, Short description, Goals & metrics, Acceptance Criteria (GIVEN/WHEN/THEN), UX/template references, Data model changes (Prisma snippet), Components list (server/client), Basic implementation plan, Risks and dependencies.
- `review.md` should include: Quick start, test accounts/data, step-by-step test cases mapped to acceptance criteria, expected outcomes, edge cases, and accessibility checks.
- Prefer existing WowDash HTML snippets for templates; list file paths and recommended snippets to adapt.
- Do NOT push PRD into taskmaster or modify task files.

Using available MCP tools:

You have two approaches:

**Option A: Use tools during generation**

- Use context7, supabase, task-master-ai, firecrawl-mcp, and playwright-mcp to gather live data while writing the PRD.
- Embed fetched documentation, schema details, code examples, and task history directly into the generated PRD sections.

**Option B: Document tools to use in the generated PRD**

- While generating the PRD, identify which MCP tools should be used and add a dedicated section called "MCP Tools & Resources" or "Development Tools" in the generated PRD.
- For each relevant tool, include:
  - Tool name and purpose
  - When to call it (e.g., "Before implementing payments, run context7 to fetch Paystack SDK docs")
  - What it retrieves (e.g., current library versions, schema, external docs)
- Examples:
  - If the batch involves Paystack: recommend context7 for SDK docs and firecrawl-mcp for latest Paystack API changes.
  - If the batch involves Supabase Auth/Realtime: recommend supabase MCP to pull current schema and feature docs.
  - If the batch has prior tasks: recommend task-master-ai to extract historical blockers and lessons learned.

Choose the approach that fits best:

- Use Option A if you can access the tools during PRD generation and want to embed live data.
- Use Option B if you want to document which tools the implementation team should call while building the feature.

Error handling & output:

- If required source files or folders are missing, return a short error listing the missing paths.
- On success, return the created folder path and the two filenames.

Keep the output concise and practical.
