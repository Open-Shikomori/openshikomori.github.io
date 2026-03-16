import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { AppProviders } from "@/app/providers/AppProviders";
import { appRouter } from "@/app/router";

import "@/shared/styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <RouterProvider router={appRouter} />
  </AppProviders>,
);
