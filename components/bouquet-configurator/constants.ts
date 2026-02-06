import type { FlowerModelType } from './types';

export const FLOWER_INFO: Record<FlowerModelType, {
  name: string;
  icon: string;
  basePrice: number;
}> = {
  rose: {
    name: 'Роза',
    icon: '\uD83C\uDF39',
    basePrice: 150,
  },
};

export const FLOWER_MODELS: Record<FlowerModelType, string> = {
  rose: '/3dmodels/bouqet/rose.glb',
};

export const WRAPPING_MODEL = '/3dmodels/bouqet/wrapping.glb';
export const RIBBON_MODEL = '/3dmodels/bouqet/ribbon.glb';

export const WRAPPING_COLORS = [
  { id: 'kraft', name: 'Крафт', value: '#c9a66b' },
  { id: 'white', name: 'Белая', value: '#f5f0eb' },
  { id: 'pink', name: 'Розовая', value: '#f8c8d8' },
  { id: 'black', name: 'Чёрная', value: '#2a2a2a' },
  { id: 'sage', name: 'Шалфей', value: '#b5c4a8' },
];

export const RIBBON_COLORS = [
  { id: 'red', name: 'Красная', value: '#c42020' },
  { id: 'pink', name: 'Розовая', value: '#e87090' },
  { id: 'white', name: 'Белая', value: '#f5f0eb' },
  { id: 'gold', name: 'Золотая', value: '#c8a040' },
  { id: 'purple', name: 'Лавандовая', value: '#9070b0' },
];
