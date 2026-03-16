import { fireEvent, render, screen, within } from "@testing-library/react";
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

  it("shows the mission, milestone, trust, roadmap, and support surfaces in English", async () => {
    renderHomepage();

    expect(
      await screen.findByRole("heading", {
        name: /collect and safeguard comorian voices with a trustworthy public shell/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /start recording/i,
      }),
    ).toHaveAttribute("data-section-target", "contribution-preview");
    expect(
      screen.getByRole("heading", {
        name: /first target: enough reviewed speech to improve a comorian whisper model/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /open-source in public, raw voices in private, consent explained in plain language/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /the roadmap is visible, but this release keeps attention on contribution readiness/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /support starts with conversation, repository visibility, and careful stewardship/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getAllByText(/public code, private dataset/i).length).toBeGreaterThan(0);
  });

  it("keeps section jumps inside the homepage instead of changing the hash route", async () => {
    renderHomepage();

    const initialHash = window.location.hash;
    const header = screen.getByRole("banner");

    fireEvent.click(
      await screen.findByRole("button", {
        name: /start recording/i,
      }),
    );

    expect(window.location.hash).toBe(initialHash);
    expect(scrollIntoViewMock).toHaveBeenCalled();

    fireEvent.click(
      within(header).getByRole("button", {
        name: /support/i,
      }),
    );

    expect(window.location.hash).toBe(initialHash);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(2);
  });

  it("renders the same trust-first structure in Arabic", async () => {
    await i18n.changeLanguage("ar");

    renderHomepage();

    expect(
      await screen.findByRole("heading", {
        name: /اجمعوا الاصوات القمرية واحفظوها من خلال واجهة عامة موثوقة/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /المصدر المفتوح يبقى في العلن، اما الاصوات الخام فتبقى في الخاص مع شرح هادئ للموافقة/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /الخارطة واضحة، لكن هذه النسخة تبقي التركيز على جاهزية المساهمة اولا/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /الدعم يبدأ بالمحادثة ووضوح المستودع وحسن ادارة البيانات/i,
      }),
    ).toBeInTheDocument();
  });
});
