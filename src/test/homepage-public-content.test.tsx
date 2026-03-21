import { fireEvent, render, screen } from "@testing-library/react";
import { RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppProviders } from "@/app/providers/AppProviders";
import { appRouter } from "@/app/router";
import { i18n } from "@/features/i18n/i18n";

const scrollIntoViewMock = vi.fn();

function renderHomepage() {
  render(
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>,
  );
}

describe("homepage public content", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
    scrollIntoViewMock.mockReset();
    HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    await i18n.changeLanguage("en");
  });

  it("shows the mission, milestone, trust, community, and support surfaces in English", async () => {
    renderHomepage();

    expect(
      await screen.findByRole("heading", {
        name: /comorian deserves ai that understands us/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /contribute your voice/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /building the foundation for comorian ai/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/your voice belongs to you/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /our community/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/open by design, private by default/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByText(/our community/i)).toBeInTheDocument();
  });

  it("keeps homepage jumps internal and leaves roadmap on its dedicated route", async () => {
    renderHomepage();

    const initialHash = window.location.hash;
    fireEvent.click(
      await screen.findByRole("button", {
        name: /how it works/i,
      }),
    );

    expect(window.location.hash).toBe(initialHash);
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getAllByRole("link", { name: /roadmap/i }).at(-1)!,
    );

    expect(window.location.hash).toBe("#/roadmap");
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByRole("heading", {
        name: /roadmap/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders the same trust-first structure in Arabic", async () => {
    await i18n.changeLanguage("ar");

    renderHomepage();

    expect(
      await screen.findByRole("heading", {
        name: /اللغة القمرية تستحق ذكاء اصطناعيا يفهمنا/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/صوتك ملكك/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /مجتمعنا/i,
      }),
    ).toBeInTheDocument();
  });
});
