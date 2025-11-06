"use client";

import Link from "next/link";
import { items } from "@/data/items";
import { ItemCard } from "@/components/item-card";
import { useTrackedItems } from "@/state/tracked-items";
import type { ArcItem } from "@/types/item";
import styles from "./cheet-sheet.module.css";

const KEEP_FOR_QUESTS = [
  "Wasp Driver",
  "Water Pump",
  "Hornet Driver",
  "Bicycle Pump",
  "Fireball Burner",
  "Camera Lens",
  "Snitch Scanner",
  "Tick Pod",
  "Deflated Football",
] as const;

const UPGRADING_BENCHES = [
  "Bastion Cell",
  "Bombardier Cell",
  "Rocketeer Driver",
  "Wasp Driver",
  "Hornet Driver",
  "Cooling Fan",
  "Sentinel Firing Core",
  "Fried Motherboard",
  "Rusted Gear",
  "Tick Pod",
  "Rusted Shut Medical Kit",
  "Power Cable",
  "Motor",
  "Laboratory Reagents",
  "Cracked Bioscanner",
  "Surveyor Vault",
  "Toaster",
  "Snitch Scanner",
  "Pop Trigger",
] as const;

const NAME_ALIASES: Record<string, string> = {
  "camera lense": "Camera Lens",
  "waasp driver": "Wasp Driver",
  "bombadier cell": "Bombardier Cell",
};

const normalizeName = (value: string) => value.trim().toLowerCase();

const nameLookup = new Map(
  items.map((item) => [normalizeName(item.name), item]),
);

const resolveByName = (rawName: string): ArcItem | undefined => {
  const normalized = normalizeName(rawName);
  const alias = NAME_ALIASES[normalized];
  const target = alias ? normalizeName(alias) : normalized;
  return nameLookup.get(target);
};

const resolveSection = (names: readonly string[]) => {
  const resolved: ArcItem[] = [];
  const missing: string[] = [];

  names.forEach((name) => {
    const item = resolveByName(name);
    if (item) {
      resolved.push(item);
    } else {
      missing.push(name);
    }
  });

  return { resolved, missing };
};

const keepResolution = resolveSection(KEEP_FOR_QUESTS);
const upgradeResolution = resolveSection(UPGRADING_BENCHES);
const prioritizedIds = new Set(
  [...keepResolution.resolved, ...upgradeResolution.resolved].map(
    (item) => item.id,
  ),
);
const recycleItems = items
  .filter((item) => !prioritizedIds.has(item.id))
  .sort((a, b) => a.name.localeCompare(b.name));
const missingNames = [...keepResolution.missing, ...upgradeResolution.missing];

export function CheetSheet() {
  const { tracked, isTracked, toggleTracked } = useTrackedItems();
  const totalTracked = Object.keys(tracked).length;

  return (
    <div className={styles.wrapper}>
      <header className={styles.headerTop}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>ARC Loot Cheat Sheet</h1>
          <p className={styles.description}>
            Shortcut the loot loop: keep the essentials for quests, set aside
            what you need for bench upgrades, and recycle the rest for scrap.
          </p>
          <p className={styles.headerNote}>
            Lists are generated directly from the master item database, so every
            card stays in sync as the data updates.
          </p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.actionLink} href="/">
            Back to Catalog
          </Link>
          <Link className={styles.actionLink} href="/tracked">
            Tracked Items ({totalTracked})
          </Link>
        </div>
      </header>

      {missingNames.length > 0 ? (
        <div className={styles.notice}>
          Missing data for: {missingNames.join(", ")}. Double-check the item
          names in public/data.json.
        </div>
      ) : null}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>High Priority</span>
          <h2 className={styles.sectionTitle}>Keep for Quests</h2>
          <p className={styles.sectionDescription}>
            These are required for current quests like Movie Night, The
            Trifecta, Wasps and Hornets, and more.
          </p>
        </div>
        <div className={styles.grid}>
          {keepResolution.resolved.map((item) => (
            <ItemCard
              key={`keep-${item.id}`}
              item={item}
              tracked={isTracked(item.id)}
              onToggle={() => toggleTracked(item.id)}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>Workbench Fuel</span>
          <h2 className={styles.sectionTitle}>Upgrading Benches</h2>
          <p className={styles.sectionDescription}>
            Stockpile these to power through bench upgrades without unexpected
            farming trips.
          </p>
        </div>
        <div className={styles.grid}>
          {upgradeResolution.resolved.map((item) => (
            <ItemCard
              key={`bench-${item.id}`}
              item={item}
              tracked={isTracked(item.id)}
              onToggle={() => toggleTracked(item.id)}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>Free Scrap</span>
          <h2 className={styles.sectionTitle}>Safely Recycle</h2>
          <p className={styles.sectionDescription}>
            Anything not tagged above drops into this bucket—dismantle freely to
            refill your scrap reserves.
          </p>
        </div>
        <div className={styles.grid}>
          {recycleItems.map((item) => (
            <ItemCard
              key={`recycle-${item.id}`}
              item={item}
              tracked={isTracked(item.id)}
              onToggle={() => toggleTracked(item.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
