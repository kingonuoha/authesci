Your task is to execute the provided PRD and generate all required project files.

Follow these rules strictly:

1. Styling & Templates

Use the template directory for all HTML, layout, and styling patterns:
@/templates/wowdash/src/html/

2. Component Reuse (DRY Principle — Mandatory)

Before creating anything new, check existing components within:
@authesci-app/components
If a suitable component exists, reuse or extend it—do not duplicate functionality.

3. Project Context & Flow

Fully understand the system before generating output.
Read the following documentation carefully and apply the information:

@docs/ai-development-tips.md

Current Database Schema:@authesci-app\prisma\schema.prisma

4. PRD to Execute
the prd of the current batch is at the @docs/batches folder, that is where you would locate the prd to execute
The PRD to implement is: