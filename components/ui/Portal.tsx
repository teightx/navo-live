"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
}

export function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const overlayRoot = document.getElementById("overlay-root");
  if (!overlayRoot) return null;

  return createPortal(children, overlayRoot);
}

