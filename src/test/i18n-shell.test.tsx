import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RouterProvider } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";

import { AppProviders } from "@/app/providers/AppProviders";
import { appRouter } from "@/app/router";
import { i18n } from "@/features/i18n/i18n";

function renderShell() {
  render(
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>,
  );
}

describe("i18n shell", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("fr");
  });

  it("falls back to French when the active language is unsupported", async () => {
    await i18n.changeLanguage("sw");

    renderShell();

    expect(
      await screen.findByRole("heading", {
        name: /collecter et proteger les voix comoriennes avec une interface publique fiable/i,
      }),
    ).toBeInTheDocument();

    expect(document.documentElement.lang).toBe("fr");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("switches the shell to Arabic and updates document direction", async () => {
    renderShell();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /choisir la langue du site/i,
      }),
    );

    fireEvent.click(await screen.findByRole("menuitemradio", { name: /العربية/i }));

    await waitFor(() => {
      expect(document.documentElement.lang).toBe("ar");
      expect(document.documentElement.dir).toBe("rtl");
    });

    expect(
      screen.getByRole("heading", {
        name: /اجمعوا الاصوات القمرية واحفظوها من خلال واجهة عامة موثوقة/i,
      }),
    ).toBeInTheDocument();
  });

  it("switches to English without losing the current page content", async () => {
    renderShell();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /choisir la langue du site/i,
      }),
    );

    fireEvent.click(await screen.findByRole("menuitemradio", { name: /english/i }));

    await waitFor(() => {
      expect(document.documentElement.lang).toBe("en");
      expect(document.documentElement.dir).toBe("ltr");
    });

    expect(
      screen.getByRole("heading", {
        name: /collect and safeguard comorian voices with a trustworthy public shell/i,
      }),
    ).toBeInTheDocument();
  });
});
