---
description: Guidelines for AI development on the Authesci project.
globs: "**/*"
alwaysApply: true
---

# AI Development Workflow for Authesci

## 1. Primary Directive

You are an expert AI development assistant for the Authesci project. Your primary goal is to understand project requirements from the provided documentation and implement features while adhering to the project's architecture, coding standards, and established workflows.

## 2. Source of Truth & Core Documentation

Before starting any task, you MUST consult the following documents to understand the context and requirements.

- **Overall Project Vision:** [`docs/batches/SOURCE_OF_TRUTH.md`](mdc:docs/batches/SOURCE_OF_TRUTH.md)

  - This is the main Product Requirements Document (PRD). It contains the project's vision, user roles, core modules, and technical stack. All development must align with this document.

- **Batch-Specific Requirements:** [`docs/batches/`](mdc:docs/batches/)

  - The project is developed in batches. Each batch has its own PRD (e.g., `1-project-setup/prd.md`). Always refer to the relevant batch document for specific tasks.

- **Database Schema:** [`docs/context/database-schema.md`](mdc:docs/context/database-schema.md)

  - This document defines the data models. Refer to it for any database-related work, especially when working with Prisma.

- **UI/UX Guidelines:** [`docs/context/ui-ux.md`](mdc:docs/context/ui-ux.md)
  - All frontend work must comply with the guidelines in this document. It covers design principles, component usage, and accessibility standards.

## 3. Core Workflow

### Step 1: Understand the Task

- Analyze the user's request.
- Cross-reference the request with the `SOURCE_OF_TRUTH.md` and the relevant batch PRD in `docs/batches/`.
- Identify all features, technical requirements, and dependencies related to the task.

### Step 2: Locate Relevant Files

- The main application code is in `authesci-app/`.
- **Frontend Components:** `authesci-app/components/`. Many components are adapted from the `wowdash-tailwind-admin/` template.
- **Pages/Routes:** `authesci-app/app/`. The project uses Next.js App Router.
- **Database Client & Schema:** `authesci-app/prisma/schema.prisma` and `authesci-app/lib/prisma.ts`.
- **Supabase Clients:** `authesci-app/lib/supabase/`.
- **API Routes:** `authesci-app/app/api/`.

### Step 3: Implementation

- **Follow Coding Standards:** Adhere to existing code style. The project uses ESLint (`authesci-app/eslint.config.mjs`).
- **UI Implementation:**
  - Use shadcn/ui components for common UI elements like dialogs, dropdowns, etc.
  - For larger layouts and styles, adapt from the `wowdash-tailwind-admin/` HTML templates.
  - Ensure all UI work aligns with `docs/context/ui-ux.md`.
- **Backend & Database:**
  - Use the singleton Prisma client (`authesci-app/lib/prisma.ts`) for all database interactions.
  - When making schema changes, update `authesci-app/prisma/schema.prisma` and generate a new migration (`npx prisma migrate dev`).
  - Use the correct Supabase SSR client (`server`, `client`, or `middleware`) depending on the context.

### Step 4: Task Completion

- Ensure the implemented functionality works as described in the PRD.
- Verify that the code follows project structure and UI/UX guidelines.
- Make sure there are no new errors or warnings.

## 4. Best Practices

- **File References:** Use `[filename](mdc:path/to/file)` to reference files in your explanations.
- **Code Examples:** Use language-specific, formatted code blocks. Show good examples and explain why they are good.
- **Consistency:** Maintain consistency with the existing codebase and design patterns.
- **Clarity:** Be clear and concise in your explanations and commit messages.

## 5. Available MCP Tools

You have access to the following Model Context Protocol (MCP) servers to assist with development:

- **firecrawl-mcp:** For web scraping and content extraction.
- **context7:** For retrieving up-to-date documentation and code examples for any library.
- **task-master-ai:** For managing and tracking tasks.
- **github:** For interacting with GitHub repositories.
- **github.com/executeautomation/mcp-playwright:** For browser automation and testing with Playwright.
- **vibe-check-mcp-server:** For UI/UX analysis and feedback.

## 6. Git Workflow for Task Completion

Upon completing a full list of tasks (e.g., all subtasks for a specific phase in the `Implementation.md`):

1.  **Create a new Git branch:** The branch name should be a concise summary of the completed work, **maximum 7 words**.
    - Example: `feat/prisma-setup-complete`
2.  **Commit your changes:** Ensure all relevant changes are committed to this new branch.
3.  **Push changes to GitHub:** Push your new branch and its commits to the `https://github.com/kingonuoha/authesci` repository.
4.  **DO NOT MERGE TO MAIN:** Under no circumstances should you merge your changes directly into the `main` branch. All merges will be handled manually by the user.
