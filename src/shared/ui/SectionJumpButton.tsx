import type { ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

type SectionJumpButtonProps = {
  children: ReactNode;
  className?: string;
  size?: ButtonSize;
  targetId: string;
  variant?: ButtonVariant;
};

function jumpToSection(targetId: string) {
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  target.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });

  if (target instanceof HTMLElement) {
    if (!target.hasAttribute("tabindex")) {
      target.tabIndex = -1;
    }

    target.focus({ preventScroll: true });
  }
}

export function SectionJumpButton({
  children,
  className,
  size = "default",
  targetId,
  variant = "default",
}: SectionJumpButtonProps) {
  return (
    <button
      aria-controls={targetId}
      className={cn(buttonVariants({ variant, size }), className)}
      data-section-target={targetId}
      onClick={() => jumpToSection(targetId)}
      type="button"
    >
      {children}
    </button>
  );
}
