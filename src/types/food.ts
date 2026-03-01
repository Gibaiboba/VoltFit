export interface Product {
  id: string;
  name: string;
  kcal: number;
  proteins: number;
  fat: number;
  carbs: number;
  category?: string;
  is_common?: boolean;
}

export interface SelectedProduct extends Product {
  weight: number; // Вес в граммах, добавляется только при выборе
}

export interface Totals {
  kcal: number;
  p: number;
  f: number;
  c: number;
}
