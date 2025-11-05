"use client";

import { TrackedItemsProvider } from "@/state/tracked-items";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <TrackedItemsProvider>{children}</TrackedItemsProvider>;
}
