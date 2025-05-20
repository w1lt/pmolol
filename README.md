# Linktree but Better

A customizable, open-source alternative to Linktree, allowing users to create a personalized page with multiple links and content blocks.

## Overview

This project is built with a modern web stack, focusing on performance, type safety, and a great developer experience. Users can manage their pages, customize appearance, and add various content types like links, text blocks, and headers.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL (or any Prisma-compatible database)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18.x or later recommended)
- npm, yarn, or pnpm
- A PostgreSQL database instance (or other Prisma-compatible database)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    Using npm:

    ```bash
    npm install
    ```

    Or using yarn:

    ```bash
    yarn install
    ```

    Or using pnpm:

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:

    ```bash
    cp .env.example .env
    ```

    Update the `.env` file with your specific configurations, especially:

    - `DATABASE_URL`: Your PostgreSQL connection string (e.g., `postgresql://user:password@host:port/database?schema=public`)
    - `NEXTAUTH_URL`: Your application's base URL (e.g., `http://localhost:3000` for development)
    - `NEXTAUTH_SECRET`: A secret key for NextAuth.js. You can generate one using `openssl rand -base64 32`.
    - Other variables as needed (e.g., for Vercel Blob, OAuth providers).

4.  **Run database migrations:**
    Apply the database schema changes:
    ```bash
    npx prisma migrate dev
    ```
    This will also generate the Prisma Client.

### Running the Development Server

Once the installation and setup are complete, you can start the development server:

Using npm:

```bash
npm run dev
```

Or using yarn:

```bash
yarn dev
```

Or using pnpm:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details (if one exists).
