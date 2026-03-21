import * as React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Drawer as DrawerPrimitive } from 'vaul';

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  showDesktopCloseButton?: boolean;
}

export function ResponsiveModal({
  open,
  onOpenChange,
  children,
  className,
  showDesktopCloseButton = true,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerPrimitive.Root
        open={open}
        onOpenChange={onOpenChange}
        direction="bottom"
        modal
        shouldScaleBackground={false}
      >
        <DrawerPrimitive.Portal>
          <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 supports-backdrop-filter:backdrop-blur-sm" />
          <DrawerPrimitive.Content
            className={cn(
              "fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh] w-screen flex-col overflow-hidden bg-card pt-[env(safe-area-inset-top)] outline-none",
              className,
            )}
          >
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Portal>
      </DrawerPrimitive.Root>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[min(90dvh,calc(100dvh-2rem))] overflow-hidden p-0 sm:max-w-md",
          className,
        )}
        showCloseButton={showDesktopCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function ResponsiveModalContainer({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col", className)}
      {...props}
    />
  );
}

export function ResponsiveModalScrollable({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", className)}
      {...props}
    />
  );
}
