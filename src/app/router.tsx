import {
  Link,
  createHashRouter,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";

import { HomePage } from "@/pages/HomePage";
import { PublicLayout } from "@/shared/ui/PublicLayout";

function PublicRouteError() {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong";
  const description = isRouteErrorResponse(error)
    ? "The page could not be loaded. Return to the homepage and try again."
    : "The public site hit an unexpected error. Return to the homepage and try again.";

  return (
    <main className="min-h-screen bg-[var(--page-background)] px-6 py-16 text-foreground sm:px-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-5 rounded-[2rem] border border-border/60 bg-card/90 p-8 shadow-[0_24px_70px_rgba(14,31,24,0.08)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-primary">
          Comorian Voice Commons
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-base leading-7 text-muted-foreground">{description}</p>
        <div>
          <Link
            className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            to="/"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}

export const appRouter = createHashRouter([
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: <PublicRouteError />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
]);
