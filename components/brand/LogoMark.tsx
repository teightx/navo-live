"use client";

import Image from "next/image";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/navo-live/brand/logo.svg"
      alt=""
      width={32}
      height={32}
      className={className}
      aria-hidden="true"
    />
  );
}
