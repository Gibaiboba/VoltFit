export interface Product {
  id: string;
  name: string;
  kcal: number;
  proteins: number;
  fat: number;
  carbs: number;
  category?: string;
  is_common?: boolean;
  food_id: string;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

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
  meal_type: string;
}

export interface SaveMealResponse {
  success: boolean;
  data?: SavedMeal; // Объект из БД (с id, калориями и т.д.)
  error: string | null;
}
export interface DiaryMealSlotProps {
  slot: { id: MealType; label: string };
  savedMeal: SavedMeal | undefined;
  isExpanded: boolean;
  isFormActiveForThisSlot: boolean;
  onToggle: (slotId: string) => void;
  onPlusClick: (e: React.MouseEvent) => void;
  onRemoveItem: (data: { mealId: string; productId: string }) => void;
  onDeleteMeal: (id: string) => void;
  onCloseSlot: (slotId: string) => void;
}
