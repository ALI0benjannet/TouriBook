import type { ReactNode } from "react";

export function Sheet({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export function SheetTrigger({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export function SheetContent({ children, className }: { children: ReactNode; side?: string; className?: string }) {
  return <div className={className}>{children}</div>;
}
