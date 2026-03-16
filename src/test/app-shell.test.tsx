import { render, screen } from "@testing-library/react";
import { RouterProvider } from "react-router";

import { AppProviders } from "@/app/providers/AppProviders";
import { appRouter } from "@/app/router";

describe("app shell", () => {
  it("renders the routed public foundation shell", async () => {
    render(
      <AppProviders>
        <RouterProvider router={appRouter} />
      </AppProviders>,
    );

    expect(
      await screen.findByRole("heading", {
        name: /collect and safeguard comorian voices with a trustworthy public shell/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/this bun-powered app shell is the baseline for multilingual public pages/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/phase 1 foundation/i)).toBeInTheDocument();
  });
});
