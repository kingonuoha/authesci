
# Template Integration and Component Conversion Workflow

This document outlines the process of integrating the WowDash template, the strategy for converting HTML snippets to React components, and guidelines for maintaining visual consistency.

## Template Project Structure

The WowDash template source files are located in the `wowdash-tailwind-admin` directory. The key directory for extracting HTML is `wowdash-tailwind-admin/src/html`.

The `html` directory is structured as follows:

- **`layouts`**: Contains the main layout templates, which define the overall page structure, including the header, sidebar, and footer.
- **`pages`**: Contains the content for individual pages. These files are typically included within one of the layouts.
- **`partial-html`**: Contains reusable HTML snippets, such as modals, cards, and other components that are used across multiple pages.

When converting the template to React components, we will primarily be working with the files in these three directories.

## HTML to React Component Conversion Guidelines

Converting static HTML to React components involves several steps to ensure the components are reusable, maintainable, and integrate well with the Next.js application.

### 1. Identify Reusable UI Elements

Before writing any code, analyze the HTML to identify repeating UI patterns and elements that can be encapsulated into components. This includes elements like buttons, cards, modals, and navigation bars.

### 2. Create a New Component File

For each identified UI element, create a new `.tsx` file in the `authesci-app/components` directory. Use a descriptive name for the file, such as `Button.tsx` or `JobCard.tsx`.

### 3. Copy and Paste the HTML

Copy the corresponding HTML snippet from the template and paste it into the `return` statement of your React component.

### 4. Convert HTML to JSX

Make the following changes to convert the HTML to JSX:

- Replace `class` with `className`.
- Replace inline `style` attributes with a style object (e.g., `style={{ color: 'red' }}`).
- Ensure all tags are properly closed (e.g., `<img ... />`).
- Replace HTML comments (`<!-- ... -->`) with JSX comments (`{/* ... */}`).

### 5. Abstract Props

Identify the parts of the component that need to be dynamic and accept data via props. For example, a `JobCard` component might accept props for the job title, company name, and location.

### 6. Handle Interactivity

Replace any template-specific JavaScript with React state and event handlers. Use `useState` for managing component state and `onClick`, `onChange`, etc., for handling user interactions.

### 7. Styling

Leverage the existing Tailwind CSS classes from the template. If custom styles are needed, they can be added to the `globals.css` file or defined within the component using CSS-in-JS or a similar approach.


## Prisma ORM Integration

This section details the setup, configuration, and usage of Prisma ORM with Supabase in the Authesci Next.js project. Prisma provides a type-safe database client and a powerful migration system, streamlining database interactions and schema management.

### 1. Installation

Install the necessary Prisma packages as development and runtime dependencies:

```bash
npm install prisma @prisma/client
# or
yarn add prisma @prisma/client
```

### 2. Configuration

Initialize Prisma in your project, which generates the `prisma` directory with `schema.prisma` and sets up the `.env.local` file for database connection strings.

```bash
npx prisma init
```

Ensure your `.env` and `.env.local` files contain the `DATABASE_URL` and `DIRECT_URL` for your Supabase PostgreSQL database. These are crucial for Prisma to connect and perform migrations.

```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
```

### 3. Schema Definition

Define your database models, relations, enums, and constraints in `prisma/schema.prisma`. The schema translates your application's data structure into a database-agnostic format.

-   **Models:** Represent database tables (e.g., `Profile`, `Job`).
-   **Relations:** Define connections between models (e.g., one-to-many, many-to-many).
-   **Enums:** Specify predefined sets of values (e.g., `Role`, `JobStatus`).
-   `@@map()`: Used to map Prisma model names (PascalCase) to `snake_case` table names in the database, and field names to `snake_case` column names.
-   `@id @default(uuid())`: Ensures unique identifiers for records.

Refer to `docs/context/database-schema.md` for the complete Authesci database schema.

### 4. Migrations

Prisma Migrate allows you to evolve your database schema in a controlled way.

-   **Generate Migration:** After modifying `prisma/schema.prisma`, run:
    ```bash
    npx prisma migrate dev --name <migration_name>
    ```
    This command creates a new migration file (SQL) and applies it to your database.
-   **Review SQL:** Always review the generated `migration.sql` file before applying changes to production.

### 5. Prisma Client Usage

A singleton Prisma Client (`lib/prisma.ts`) is implemented to prevent multiple instances and manage database connections efficiently in a Next.js environment.

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
```

Import and use this client for all your database queries to leverage type safety and auto-completion.

### 6. Supabase SSR Client Usage

The project utilizes `@supabase/ssr` to provide Supabase clients optimized for different Next.js contexts:

-   `lib/supabase/server.ts`: For Server Components, Server Actions, and Route Handlers.
-   `lib/supabase/client.ts`: For Client Components.
-   `lib/supabase/middleware.ts`: For Next.js middleware, primarily for session refreshing.

These clients ensure correct handling of cookies and session persistence across server and client environments.

### 7. Utilities

-   `lib/db/helpers.ts`: Provides reusable functions for handling common Prisma errors (e.g., `NotFoundError`, `DuplicateError`).
-   `lib/db/types.ts`: Re-exports and defines custom TypeScript types derived from Prisma Client, improving type consistency.

### 8. Development Scripts

The `package.json` includes scripts to streamline Prisma workflows:

-   `npm run prisma:generate`: Generates the Prisma Client based on `schema.prisma`.
-   `npm run prisma:migrate`: Runs `prisma migrate dev` to create and apply migrations.
-   `npm run prisma:studio`: Launches Prisma Studio to visually browse and manage your database data.
-   `npm run db:seed`: Executes `prisma/seed.ts` to populate the database with test data.

### 9. Troubleshooting

-   **`DIRECT_URL` not found:** Ensure `DIRECT_URL` is set in your `.env` file, typically mirroring your `DATABASE_URL`.
-   **Connection Limits:** Use the singleton Prisma Client (`lib/prisma.ts`) to manage connections efficiently. Supabase projects on the free tier have connection limits.
-   **Type Generation Failures:** Run `npx prisma validate` to check your schema for errors, then `npm run prisma:generate` to regenerate types. If issues persist, clear `node_modules` and reinstall.
-   **SSR Cookie Errors:** Verify the correct Supabase client (`server.ts`, `client.ts`, `middleware.ts`) is used in the appropriate Next.js context. Consult Supabase SSR documentation for specific cookie handling guidelines.



