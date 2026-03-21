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
        name: /comorian deserves ai that understands us/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/most ai doesn't speak shikomori/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/building the foundation for comorian ai/i)).toBeInTheDocument();
  });
});
