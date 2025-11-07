"use client";

import Link from "next/link";
import { items } from "@/data/items";
import { ItemCard } from "@/components/item-card";
import { useTrackedItems } from "@/state/tracked-items";
import type { ArcItem } from "@/types/item";
import styles from "./cheet-sheet.module.css";

const KEEP_FOR_QUESTS = [
  { name: "Wasp Driver", quantity: 3 },
  { name: "Water Pump", quantity: 1 },
  { name: "Hornet Driver", quantity: 3 },
  { name: "Bicycle Pump", quantity: 1 },
  { name: "Fireball Burner", quantity: 1 },
  { name: "Camera Lens", quantity: 1 },
  { name: "Snitch Scanner", quantity: 2 },
  { name: "Tick Pod", quantity: 1 },
  { name: "Deflated Football", quantity: 1 },
] as const;

const UPGRADING_BENCHES = [
  { name: "Bastion Cell", quantity: 6 },
  { name: "Bombardier Cell", quantity: 5 },
  { name: "Rocketeer Driver", quantity: 4 },
  { name: "Wasp Driver", quantity: 8 },
  { name: "Hornet Driver", quantity: 8 },
  { name: "Cooling Fan", quantity: 5 },
  { name: "Sentinel Firing Core", quantity: 4 },
  { name: "Fried Motherboard", quantity: 3 },
  { name: "Rusted Gear", quantity: 3 },
  { name: "Tick Pod", quantity: 8 },
  { name: "Rusted Shut Medical Kit", quantity: 3 },
  { name: "Power Cable", quantity: 3 },
  { name: "Motor", quantity: 3 },
  { name: "Laboratory Reagents", quantity: 3 },
  { name: "Cracked Bioscanner", quantity: 2 },
  { name: "Surveyor Vault", quantity: 2 },
  { name: "Toaster", quantity: 3 },
  { name: "Snitch Scanner", quantity: 8 },
  { name: "Pop Trigger", quantity: 8 },
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

const keepQuantityLookup = new Map(
  KEEP_FOR_QUESTS.map(({ name, quantity }) => [
    normalizeName(name),
    quantity,
  ]),
);
const upgradeQuantityLookup = new Map(
  UPGRADING_BENCHES.map(({ name, quantity }) => [
    normalizeName(name),
    quantity,
  ]),
);
const keepResolution = resolveSection(KEEP_FOR_QUESTS.map((item) => item.name));
const upgradeResolution = resolveSection(
  UPGRADING_BENCHES.map((item) => item.name),
);
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
          {keepResolution.resolved.map((item) => {
            const quantity = keepQuantityLookup.get(normalizeName(item.name));

            return (
              <ItemCard
                key={`keep-${item.id}`}
                item={item}
                tracked={isTracked(item.id)}
                onToggle={() => toggleTracked(item.id)}
                badge={quantity ? `${quantity}x` : undefined}
              />
            );
          })}
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
          {upgradeResolution.resolved.map((item) => {
            const quantity = upgradeQuantityLookup.get(normalizeName(item.name));

            return (
              <ItemCard
                key={`bench-${item.id}`}
                item={item}
                tracked={isTracked(item.id)}
                onToggle={() => toggleTracked(item.id)}
                badge={quantity ? `${quantity}x` : undefined}
              />
            );
          })}
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
