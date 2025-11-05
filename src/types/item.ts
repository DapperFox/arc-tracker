export type EffectsMap = Record<string, string | number>;

export type ArcItem = {
  id: string;
  name: string;
  description?: string;
  type?: string;
  rarity?: string;
  value?: number;
  imageFilename?: string;
  weightKg?: number;
  stackSize?: number;
  foundIn?: string;
  effects?: EffectsMap;
  recyclesInto?: Record<string, number>;
  salvagesInto?: Record<string, number>;
};
