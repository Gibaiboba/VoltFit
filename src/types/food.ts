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
export interface SavedMeal {
  id: string;
  meal_name: string;
  total_kcal: number;
  total_p: number;
  total_f: number;
  total_c: number;
  items: SelectedProduct[];
  created_at: string;
}
