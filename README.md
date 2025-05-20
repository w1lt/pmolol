# linktree but Better

A customizable, open-source alternative to Linktree, allowing users to create a personalized page with multiple links and content blocks.

## technologies

- **Core:** Next.js, TypeScript, Prisma, PostgreSQL, NextAuth.js
- **UI:** Tailwind CSS, shadcn/ui, Lucide React

## getting Started

### pre reqs

- Node.js (v18.x or later)
- npm, yarn, or pnpm
- PostgreSQL (or other Prisma-compatible database)

### setup

1.  **clone & install:**

    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    npm install
    ```

2.  **env variables:**
    Copy `.env.example` to `.env` and update it with your database URL, NextAuth secret, etc.

    ```bash
    cp .env.example .env
    ```

    Key variables:

    - `DATABASE_URL`: PostgreSQL connection string.
    - `NEXTAUTH_URL`: Base URL (e.g., `http://localhost:3000`).
    - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`.

3.  **db migration:**
    ```bash
    npx prisma migrate dev
    ```

### running in dev

```bash
npm run dev
```

Access at [http://localhost:3000](http://localhost:3000).
