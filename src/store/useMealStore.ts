import { create } from "zustand";
import { Product, SelectedProduct, Totals } from "@/types/food";

interface MealState {
  selectedItems: SelectedProduct[];
  addItem: (product: Product) => void;
  clearItems: () => void;
  removeItem: (id: string) => void;
  updateWeight: (id: string, weight: number) => void;
  getTotal: () => Totals;
}

export const useMealStore = create<MealState>((set, get) => ({
  selectedItems: [],

  // Добавление продукта (по умолчанию 100г)
  addItem: (product: Product) => {
    const exists = get().selectedItems.find((item) => item.id === product.id);
    if (!exists) {
      set((state) => ({
        selectedItems: [...state.selectedItems, { ...product, weight: 100 }],
      }));
    }
  },

  // Очистка всей корзины
  clearItems: () => set({ selectedItems: [] }),

  // Удаление одной позиции
  removeItem: (id: string) =>
    set((state) => ({
      selectedItems: state.selectedItems.filter((item) => item.id !== id),
    })),

  // Обновление веса конкретного продукта
  updateWeight: (id: string, weight: number) =>
    set((state) => ({
      selectedItems: state.selectedItems.map((item) =>
        item.id === id ? { ...item, weight: Math.max(0, weight) } : item,
      ),
    })),

  // Расчет итогов БЖУ и калорий на лету
  getTotal: (): Totals => {
    return get().selectedItems.reduce(
      (acc, item) => {
        const factor = item.weight / 100;
        return {
          kcal: acc.kcal + item.kcal * factor,
          p: acc.p + (item.proteins || 0) * factor,
          f: acc.f + (item.fat || 0) * factor,
          c: acc.c + (item.carbs || 0) * factor,
        };
      },
      { kcal: 0, p: 0, f: 0, c: 0 },
    );
  },
}));
