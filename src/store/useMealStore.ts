import { create } from "zustand";
import { Product, SelectedProduct, Totals, MealType } from "@/types/food";

interface MealState {
  selectedItems: SelectedProduct[];
  activeMealType: MealType | null;
  activeMealId: string | null; // ID записи из базы для редактирования

  addItem: (product: Product) => void;
  clearItems: () => void;
  removeItem: (id: string) => void;
  updateWeight: (id: string, weight: number) => void;
  setMealType: (type: MealType | null) => void;

  // Новый метод: загружает существующую еду из базы в конструктор
  loadItems: (items: SelectedProduct[], type: MealType, id: string) => void;

  getTotal: () => Totals;
}

export const useMealStore = create<MealState>((set, get) => ({
  selectedItems: [],
  activeMealType: null,
  activeMealId: null,

  setMealType: (type) => set({ activeMealType: type }),

  // Загружаем данные из БД для редактирования/дополнения
  loadItems: (items, type, id) =>
    set({
      selectedItems: items,
      activeMealType: type,
      activeMealId: id,
    }),

  addItem: (product: Product) => {
    const exists = get().selectedItems.find((item) => item.id === product.id);
    if (!exists) {
      set((state) => ({
        selectedItems: [...state.selectedItems, { ...product, weight: 100 }],
      }));
    }
  },

  // Сбрасываем всё: и продукты, и тип, и ID сессии
  clearItems: () =>
    set({
      selectedItems: [],
      activeMealType: null,
      activeMealId: null,
    }),

  removeItem: (id: string) =>
    set((state) => ({
      selectedItems: state.selectedItems.filter((item) => item.id !== id),
    })),

  updateWeight: (id: string, weight: number) =>
    set((state) => ({
      selectedItems: state.selectedItems.map((item) =>
        item.id === id ? { ...item, weight: Math.max(1, weight) } : item,
      ),
    })),

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
