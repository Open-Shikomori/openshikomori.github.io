import { createHashRouter } from "react-router";

import { AboutPage } from "@/pages/AboutPage";
import { DatasetPage } from "@/pages/DatasetPage";
import { HomePage } from "@/pages/HomePage";
import { RoadmapPage } from "@/pages/RoadmapPage";
import { TermsPage } from "@/pages/TermsPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ErrorPage } from "@/pages/ErrorPage";
import { PublicLayout } from "@/shared/ui/PublicLayout";
import {
  ContributePage,
  ReviewPage,
  ContributeLayout,
} from "@/features/contribution";
import {
  AdminLayout,
  AdminLoginPage,
  AdminDashboardPage,
  AdminClipsPage,
  AdminCorrectionsPage,
  AdminUsersPage,
  AdminContributorsPage,
  AdminAdminsPage,
  AdminSettingsPage,
} from "@/features/admin";

export const appRouter = createHashRouter([
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "dataset",
        element: <DatasetPage />,
      },
      {
        path: "roadmap",
        element: <RoadmapPage />,
      },
      {
        path: "terms",
        element: <TermsPage />,
      },
      {
        path: "privacy",
        element: <PrivacyPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  // Contribute Routes - Separate layout for post-auth experience
  {
    path: "/contribute",
    element: <ContributeLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <ContributePage />,
      },
      {
        path: "stats",
        element: <ContributePage />,
      },
      {
        path: "review",
        element: <ReviewPage />,
      },
    ],
  },
  // Admin Routes - Separate layout
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: "clips",
        element: <AdminClipsPage />,
      },
      {
        path: "corrections",
        element: <AdminCorrectionsPage />,
      },
      {
        path: "users",
        element: <AdminUsersPage />,
      },
      {
        path: "contributors",
        element: <AdminContributorsPage />,
      },
      {
        path: "admins",
        element: <AdminAdminsPage />,
      },
      {
        path: "settings",
        element: <AdminSettingsPage />,
      },
    ],
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
    errorElement: <ErrorPage />,
  },
]);
