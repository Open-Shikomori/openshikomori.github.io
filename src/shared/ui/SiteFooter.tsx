import { Github, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="mt-20 border-t border-border bg-background sm:mt-32" role="contentinfo">
      <div className="w-full">
        {/* Logo Section */}
        <div className="border-b border-border px-4 py-12 sm:px-6 sm:py-16 lg:px-16 lg:py-24">
          <div className="max-w-4xl space-y-4 sm:space-y-6">
            <img
              src="/logo.svg"
              alt="OpenShikomori"
              className="h-auto w-full max-w-[240px] sm:max-w-[320px] lg:max-w-[400px]"
            />
            <p className="max-w-lg text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
              Building the first open-source language models for Comorian —
              preserving culture through AI accessibility.
            </p>
          </div>
        </div>

        {/* Mega Footer Bottom */}
        <div className="bg-muted/10 px-4 py-10 sm:px-6 sm:py-12 lg:px-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_2fr] lg:gap-24">
            <div>
              <p className="max-w-xs text-sm font-medium leading-relaxed text-muted-foreground">
                Democratizing AI for the Comorian language through open-source research, datasets, and language models. Join us in building technology that serves local communities.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8">
              <div className="flex flex-col gap-3 sm:gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Project
                </p>
                <Link
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  to="/about"
                >
                  About
                </Link>
                <Link
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  to="/dataset"
                >
                  Dataset
                </Link>
                <Link
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  to="/roadmap"
                >
                  {t("site.nav.roadmap")}
                </Link>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Connect
                </p>
                <a
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  href="https://github.com/Open-Shikomori"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Github className="size-4" /> GitHub
                </a>
                <a
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  href="mailto:fanom2813@gmail.com"
                >
                  <Mail className="size-4" /> Contact
                </a>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Legal
                </p>
                <Link
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  to="/terms"
                >
                  Terms of Use
                </Link>
                <Link
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  to="/privacy"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:mt-16 sm:flex-row sm:pt-8">
            <p className="text-xs font-medium tracking-wider text-muted-foreground">
              © {new Date().getFullYear()} {t("site.brand")}. Released under MIT License.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground">
              <span className="inline-block h-2 w-2 bg-primary" />
              Engineered for Comoros
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
