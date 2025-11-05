import rawItems from "../../public/data.json";
import type { ArcItem } from "@/types/item";

export const items: ArcItem[] = (rawItems ?? []) as ArcItem[];

export const itemTypes = Array.from(
  new Set(
    items
      .map((item) => item.type?.trim())
      .filter((type): type is string => Boolean(type)),
  ),
).sort((a, b) => a.localeCompare(b));

export const getItemById = (id: string) =>
  items.find((item) => item.id === id);
