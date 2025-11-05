// use client is required for localStorage usage
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "arc-tracker:tracked-items";

export type TrackedItem = {
  have: number;
  need: number;
};

type TrackedItemsState = Record<string, TrackedItem>;

type TrackedItemsContextValue = {
  tracked: TrackedItemsState;
  isTracked: (id: string) => boolean;
  toggleTracked: (id: string) => void;
  updateTracked: (id: string, update: Partial<TrackedItem>) => void;
  removeTracked: (id: string) => void;
};

const TrackedItemsContext = createContext<TrackedItemsContextValue | undefined>(
  undefined,
);

const readFromStorage = (): TrackedItemsState => {
  if (typeof window === "undefined") {
    return {};
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {};
  }

  try {
    const parsed = JSON.parse(stored) as TrackedItemsState;
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (error) {
    console.warn("Failed to parse tracked items from storage", error);
  }

  return {};
};

const writeToStorage = (state: TrackedItemsState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export function TrackedItemsProvider({ children }: { children: ReactNode }) {
  const [tracked, setTracked] = useState<TrackedItemsState>(() =>
    readFromStorage(),
  );

  useEffect(() => {
    writeToStorage(tracked);
  }, [tracked]);

  const value = useMemo<TrackedItemsContextValue>(
    () => ({
      tracked,
      isTracked: (id: string) => Boolean(tracked[id]),
      toggleTracked: (id: string) => {
        setTracked((current) => {
          if (current[id]) {
            const next = { ...current };
            delete next[id];
            return next;
          }
          return {
            ...current,
            [id]: { have: 0, need: 0 },
          };
        });
      },
      updateTracked: (id, update) => {
        setTracked((current) => {
          const existing = current[id] ?? { have: 0, need: 0 };
          return {
            ...current,
            [id]: {
              ...existing,
              ...update,
            },
          };
        });
      },
      removeTracked: (id: string) => {
        setTracked((current) => {
          if (!current[id]) {
            return current;
          }

          const next = { ...current };
          delete next[id];
          return next;
        });
      },
    }),
    [tracked],
  );

  return (
    <TrackedItemsContext.Provider value={value}>
      {children}
    </TrackedItemsContext.Provider>
  );
}

export function useTrackedItems() {
  const context = useContext(TrackedItemsContext);
  if (!context) {
    throw new Error("useTrackedItems must be used within TrackedItemsProvider");
  }
  return context;
}
