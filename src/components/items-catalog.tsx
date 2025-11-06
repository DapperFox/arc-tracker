"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { items, itemTypes } from "@/data/items";
import { useTrackedItems } from "@/state/tracked-items";
import { ItemCard } from "@/components/item-card";
import styles from "./items-catalog.module.css";

const ALL_TYPES = "All Types";

export function ItemsCatalog() {
  const { tracked, isTracked, toggleTracked } = useTrackedItems();
  const [selectedType, setSelectedType] = useState<string>(ALL_TYPES);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return items
      .filter((item) => {
        if (selectedType !== ALL_TYPES) {
          const typeMatches =
            item.type?.toLowerCase() === selectedType.toLowerCase();
          if (!typeMatches) {
            return false;
          }
        }

        if (!normalizedSearch) {
          return true;
        }

        return item.name.toLowerCase().includes(normalizedSearch);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedType, searchTerm]);

  const totalTracked = Object.keys(tracked).length;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>ARC Field Kit</h1>
          <p className={styles.subtitle}>
            Browse every known item, tag the ones you need, and plan your next
            run.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.linkButton} href="/tracked">
            Tracked Items ({totalTracked})
          </Link>
          <Link
            className={`${styles.linkButton} ${styles.secondaryLink}`}
            href="/cheet-sheet"
          >
            Cheat Sheet
          </Link>
        </div>
      </header>

      <section className={styles.controls}>
        <label className={styles.searchField}>
          <span className={styles.labelText}>Search</span>
          <input
            type="text"
            placeholder="Find by name..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
        <label className={styles.typeField}>
          <span className={styles.labelText}>Type</span>
          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
          >
            <option value={ALL_TYPES}>{ALL_TYPES}</option>
            {itemTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className={styles.resultsSummary}>
        Showing {filteredItems.length} of {items.length} items
      </section>

      {filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          No items match your current filters. Try a different search or type.
        </div>
      ) : (
        <section className={styles.grid}>
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              tracked={isTracked(item.id)}
              onToggle={() => toggleTracked(item.id)}
            />
          ))}
        </section>
      )}
    </div>
  );
}
