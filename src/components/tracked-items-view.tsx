"use client";

import Link from "next/link";
import { useMemo } from "react";
import { getItemById } from "@/data/items";
import { useTrackedItems } from "@/state/tracked-items";
import styles from "./tracked-items-view.module.css";

const sanitizeQuantity = (value: string) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return Math.floor(parsed);
};

export function TrackedItemsView() {
  const { tracked, updateTracked, removeTracked } = useTrackedItems();

  const trackedItems = useMemo(() => {
    return Object.entries(tracked)
      .map(([id, counts]) => {
        const item = getItemById(id);
        if (!item) {
          return null;
        }

        const have = counts.have ?? 0;
        const need = counts.need ?? 0;
        const remaining = Math.max(0, need - have);

        const isComplete = remaining === 0 && need > 0;

        return {
          item,
          counts: { have, need, remaining, isComplete },
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .sort((a, b) => a.item.name.localeCompare(b.item.name));
  }, [tracked]);

  const totalRemaining = trackedItems.reduce(
    (sum, entry) => sum + entry.counts.remaining,
    0,
  );

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tracked Loadout</h1>
          <p className={styles.subtitle}>
            Keep tabs on the items you’re hunting for so you can craft, upgrade,
            and deploy faster.
          </p>
        </div>
        <Link className={styles.catalogLink} href="/">
          ← Back to Catalog
        </Link>
      </header>

      <section className={styles.summary}>
        <div>
          <span className={styles.summaryNumber}>{trackedItems.length}</span>
          <span className={styles.summaryLabel}>Tracked Items</span>
        </div>
        <div>
          <span className={styles.summaryNumber}>{totalRemaining}</span>
          <span className={styles.summaryLabel}>Still Needed</span>
        </div>
      </section>

      {trackedItems.length === 0 ? (
        <div className={styles.emptyState}>
          You haven’t marked anything yet. Head back to the catalog and track
          items you’re looking for.
        </div>
      ) : (
        <div className={styles.grid}>
          {trackedItems.map(({ item, counts }) => {
            const removeButtonClass = counts.isComplete
              ? `${styles.removeButton} ${styles.removeButtonComplete}`
              : styles.removeButton;
            const remainingClass = counts.isComplete
              ? `${styles.remaining} ${styles.remainingComplete}`
              : styles.remaining;

            return (
              <article key={item.id} className={styles.card}>
                <header className={styles.cardHeader}>
                  <div>
                    <h2 className={styles.cardTitle}>{item.name}</h2>
                    <p className={styles.cardMeta}>
                      {item.type ?? "Unknown Type"}
                      {item.rarity ? ` · ${item.rarity}` : ""}
                    </p>
                  </div>
                  <button
                    className={removeButtonClass}
                    type="button"
                    onClick={() => removeTracked(item.id)}
                    aria-label={
                      counts.isComplete
                        ? `Remove completed item ${item.name}`
                        : `Stop tracking ${item.name}`
                    }
                  >
                    {counts.isComplete ? "✓" : "×"}
                  </button>
                </header>

                {item.description ? (
                  <p className={styles.cardDescription}>{item.description}</p>
                ) : null}

                <div className={styles.cardBody}>
                  <label className={styles.countField}>
                    <span>Need</span>
                    <input
                      type="number"
                      min={0}
                      value={counts.need}
                      onChange={(event) =>
                        updateTracked(item.id, {
                          need: sanitizeQuantity(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label className={styles.countField}>
                    <span>Have</span>
                    <input
                      type="number"
                      min={0}
                      value={counts.have}
                      onChange={(event) =>
                        updateTracked(item.id, {
                          have: sanitizeQuantity(event.target.value),
                        })
                      }
                    />
                  </label>
                  <div className={remainingClass}>
                    <span>{counts.isComplete ? "Complete" : "Remaining"}</span>
                    <strong>
                      {counts.isComplete ? "✓" : counts.remaining}
                    </strong>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
