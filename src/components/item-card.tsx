"use client";

import Image from "next/image";
import styles from "./item-card.module.css";
import type { ArcItem } from "@/types/item";
import type { ChangeEvent } from "react";

type ItemCardProps = {
  item: ArcItem;
  tracked: boolean;
  onToggle: () => void;
  badge?: string;
};

const formatNumber = (value?: number) =>
  typeof value === "number" ? value.toLocaleString() : "—";

export function ItemCard({ item, tracked, onToggle, badge }: ItemCardProps) {
  const hasImage = Boolean(item.imageFilename);
  const imageAlt = `${item.name} artwork`;

  const handleToggle = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onToggle();
  };

  return (
    <article className={styles.card}>
      {badge ? <span className={styles.badge}>{badge}</span> : null}
      <div className={styles.header}>
        {hasImage ? (
          <div className={styles.imageWrap}>
            <Image
              src={item.imageFilename as string}
              alt={imageAlt}
              fill
              sizes="120px"
              className={styles.image}
              priority={false}
            />
          </div>
        ) : (
          <div className={styles.imageFallback} aria-hidden="true">
            {item.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className={styles.titleBlock}>
          <h3 className={styles.name}>{item.name}</h3>
          <p className={styles.subtitle}>
            {item.type ?? "Unknown Type"}
            {item.rarity ? ` · ${item.rarity}` : ""}
          </p>
        </div>
        <label className={styles.trackToggle}>
          <input type="checkbox" checked={tracked} onChange={handleToggle} />
          <span>Track</span>
        </label>
      </div>
      {item.description ? (
        <p className={styles.description}>{item.description}</p>
      ) : null}
      <div className={styles.details}>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Value</span>
          <span className={styles.detailValue}>{formatNumber(item.value)}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Weight</span>
          <span className={styles.detailValue}>
            {item.weightKg ? `${item.weightKg} kg` : "—"}
          </span>
        </div>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Stack</span>
          <span className={styles.detailValue}>{item.stackSize ?? "—"}</span>
        </div>
      </div>
      {item.foundIn ? (
        <p className={styles.foundIn}>
          <span className={styles.sectionLabel}>Found in:</span> {item.foundIn}
        </p>
      ) : null}
      {item.effects ? (
        <div className={styles.effects}>
          {Object.entries(item.effects)
            .slice(0, 3)
            .map(([label, value]) => (
              <span key={label} className={styles.effect}>
                <span className={styles.effectLabel}>{label}</span>
                <span className={styles.effectValue}>{String(value)}</span>
              </span>
            ))}
        </div>
      ) : null}
    </article>
  );
}
