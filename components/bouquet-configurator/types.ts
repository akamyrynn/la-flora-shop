export type FlowerModelType = 'rose';

export interface BouquetConfig {
  flowers: { type: FlowerModelType; count: number }[];
  wrappingColor: string;
  ribbonColor: string;
}
