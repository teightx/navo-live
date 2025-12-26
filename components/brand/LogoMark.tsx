"use client";

import Image from "next/image";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/brand/logo.png"
      alt=""
      width={32}
      height={32}
      className={className}
      aria-hidden="true"
      unoptimized
    />
  );
}
