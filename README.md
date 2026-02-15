
# Extreme V2 - Modern Video Platform

A production-ready, scalable video sharing platform built with **Next.js 15**. Re-engineered for performance, user experience, and developer productivity.

## Sample Website

https://extreme-v2.vercel.app/

## Tech Stack

-   **Frontend**: [Next.js 15](https://nextjs.org) (App Router, Server Components), [TypeScript](https://www.typescriptlang.org), [Tailwind CSS](https://tailwindcss.com).
-   **UI Library**: [Shadcn/UI](https://ui.shadcn.com) (Radix Primitives).
-   **Database**: [PostgreSQL](https://www.postgresql.org) (via [Neon Serverless](https://neon.tech)).
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team).
-   **Authentication**: [Clerk](https://clerk.com).
-   **Video Infrastructure**: [Cloudinary](https://cloudinary.com) (Upload, Transcoding, Streaming).
-   **State Management**: React Query (Server state), Zustand (Client state).
-   **Testing**: Jest (Unit), Playwright (E2E).

## Features

-   **Video Management**:
    -   Drag & Drop Uploads directly to Cloudinary.
    -   Automatic generating of HLS streams and thumbnails.
    -   User Dashboard to manage videos.
-   **Discovery**:
    -   **Trending Algorithm**: Suggests videos based on recency and engagement.
    -   **Search**: Full-text search for videos and users.
    -   **Infinite Scroll**: Performant feed with virtualization.
-   **Social Interactions**:
    -   **Subscriptions**: Follow creators and see their latest videos in your **Subscriptions Feed**.
    -   **Comments**: Nested replies and **@mentions** support.
    -   **Likes**: Optimistic UI updates for instant feedback.
    -   **Notifications**: Real-time alerts for mentions, likes, and new followers.
-   **Playlists & History**:
    -   **Watch History**: AUTOMATICALLY logs your views. Resumable playback (future). Auto-prunes history older than 30 days.
    -   **Playlists**: Create and manage custom playlists.
    -   **"Liked Videos"**: Auto-generated playlist of your liked content.
-   **UI/UX**:
    -   **Modern Polish**: Animated interactions (e.g., Sign-in button, Like button).
    -   Dark/Light mode.
    -   Skeleton loaders and empty states.
    -   Responsive sidebar with collapsible menus.

## Getting Started

### Prerequisites

-   Node.js 18+
-   PostgreSQL Database (Neon recommended)
-   Clerk Account
-   Cloudinary Account

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/extreme-v2.git
    cd extreme-v2
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # Install Playwright browsers (for testing)
    npx playwright install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add the following keys:
    ```env
    # Database (Neon)
    DATABASE_URL=postgresql://...

    # Auth (Clerk)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

    # Video (Cloudinary)
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
    NEXT_PUBLIC_CLOUDINARY_API_KEY=...
    CLOUDINARY_API_SECRET=...
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
    ```

4.  **Database Migration**:
    Push the schema to your database.
    ```bash
    npm run db:push
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## Testing

### Unit Tests (Jest)
Runs tests for utility functions and isolated components (e.g., `SubscribeButton`).
```bash
npm test
```

### End-to-End Tests (Playwright)
Runs comprehensive browser automation tests for critical flows (Navigation, Search, Watch Page).
```bash
npx playwright test
```

## Project Structure

-   `src/app`: Next.js App Router pages and layouts.
-   `src/components`: Reusable UI components.
-   `src/actions`: Server Actions for data mutation and fetching.
-   `src/db`: Drizzle schema and connection setup.
-   `src/lib`: Utility functions and auth helpers.
-   `e2e`: Playwright test specifications.
-   `__tests__`: Jest unit tests.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

1.  **Push to GitHub**: Make sure your project is pushed to a GitHub repository.
2.  **Import Project in Vercel**:
    -   Go to Vercel Dashboard -> Add New... -> Project.
    -   Select your GitHub repository.
3.  **Configure Environment Variables**:
    -   Copy the contents of your `.env.local` file.
    -   Paste them into the "Environment Variables" section in Vercel during import.
    -   *Note: Ensure `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and all Cloudinary keys are set.*
4.  **Deploy**: Click "Deploy". Vercel will automatically build and deploy your site on every push to the `main` branch.

## License

MIT
