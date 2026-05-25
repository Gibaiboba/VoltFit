import { MealType } from "@/types/food";
// Фиксированный список слотов в правильном порядке
export const MEAL_SLOTS: { id: MealType; label: string }[] = [
  { id: "breakfast", label: "Завтрак" },
  { id: "lunch", label: "Обед" },
  { id: "dinner", label: "Ужин" },
  { id: "snack", label: "Перекус" },
];
