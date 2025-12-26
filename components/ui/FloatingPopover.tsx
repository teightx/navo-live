"use client";

import * as React from "react";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
  Placement,
} from "@floating-ui/react-dom";
import { createPortal } from "react-dom";

interface FloatingPopoverProps {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
  placement?: Placement;
  maxHeight?: number;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    function handleChange(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

export function FloatingPopover({
  open,
  anchorRef,
  onClose,
  className = "",
  children,
  placement = "bottom-start",
  maxHeight = 360,
}: FloatingPopoverProps) {
  const [mounted, setMounted] = React.useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const clickOutsideRef = React.useRef<HTMLDivElement>(null);

  const { x, y, strategy, refs, floatingStyles, update } = useFloating({
    placement,
    open,
    middleware: [
      offset(10),
      flip({ padding: 12 }),
      shift({ padding: 12 }),
      size({
        padding: 12,
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.min(maxHeight, availableHeight)}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Mount check for portal
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Set reference element
  React.useLayoutEffect(() => {
    if (anchorRef.current) {
      refs.setReference(anchorRef.current);
    }
  }, [anchorRef, refs]);

  // Update position when opened
  React.useEffect(() => {
    if (open && anchorRef.current) {
      refs.setReference(anchorRef.current);
      update();
    }
  }, [open, anchorRef, refs, update]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Close on click outside
  React.useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      
      // Don't close if clicked on anchor
      if (anchorRef.current?.contains(target)) return;
      
      // Don't close if clicked inside popover
      if (clickOutsideRef.current?.contains(target)) return;

      onClose?.();
    }

    // Delay to avoid conflict with the click that opened
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose, anchorRef]);

  // Block body scroll on mobile
  React.useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isMobile, open]);

  if (!open || !mounted) return null;

  const overlayRoot = document.getElementById("overlay-root") || document.body;

  // Mobile: Bottom sheet
  if (isMobile) {
    return createPortal(
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-[9998] bg-black/30 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Bottom sheet */}
        <div
          ref={clickOutsideRef}
          role="dialog"
          aria-modal="true"
          className={`
            fixed left-0 right-0 bottom-0 z-[9999]
            rounded-t-2xl overflow-hidden
            animate-slide-up
          `}
          style={{
            maxHeight: "85vh",
            background: "var(--popover-bg)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--card-border)",
            borderBottom: "none",
            boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div 
              className="w-10 h-1 rounded-full"
              style={{ background: "var(--ink-muted)", opacity: 0.3 }}
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "calc(85vh - 24px)" }}>
            {children}
          </div>
        </div>
      </>,
      overlayRoot
    );
  }

  // Desktop: Floating popover with flip/shift
  return createPortal(
    <div
      ref={(el) => {
        refs.setFloating(el);
        (clickOutsideRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      role="dialog"
      aria-modal="true"
      style={{
        position: strategy,
        left: x ?? 0,
        top: y ?? 0,
        zIndex: 9999,
        background: "var(--popover-bg)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--card-shadow)",
      }}
      className={`rounded-xl overflow-hidden ${className}`}
    >
      <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight}px` }}>
        {children}
      </div>
    </div>,
    overlayRoot
  );
}
