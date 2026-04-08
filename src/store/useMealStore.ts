import { create } from "zustand";
import { Product, SelectedProduct, Totals } from "@/types/food";
import { SupabaseClient } from "@supabase/supabase-js";
import { queryClient } from "@/lib/query-client";

interface SaveMealResponse {
  success: boolean;
  error: string | null;
}

interface MealState {
  selectedItems: SelectedProduct[];
  addItem: (product: Product) => void;
  clearItems: () => void;
  removeItem: (id: string) => void;
  updateWeight: (id: string, weight: number) => void;
  getTotal: () => Totals;
  saveMeal: (
    supabase: SupabaseClient,
    userId: string,
  ) => Promise<SaveMealResponse>;
}

export const useMealStore = create<MealState>((set, get) => ({
  selectedItems: [],

  addItem: (product: Product) => {
    const exists = get().selectedItems.find((item) => item.id === product.id);
    if (!exists) {
      set((state) => ({
        selectedItems: [...state.selectedItems, { ...product, weight: 100 }],
      }));
    }
  },
  clearItems: () => set({ selectedItems: [] }),
  removeItem: (id: string) =>
    set((state) => ({
      selectedItems: state.selectedItems.filter((item) => item.id !== id),
    })),

  updateWeight: (id: string, weight: number) =>
    set((state) => ({
      selectedItems: state.selectedItems.map((item) =>
        item.id === id ? { ...item, weight: Math.max(0, weight) } : item,
      ),
    })),

  saveMeal: async (
    supabase: SupabaseClient,
    userId: string,
  ): Promise<SaveMealResponse> => {
    const { selectedItems, getTotal } = get();
    const totals = getTotal();

    if (selectedItems.length === 0) {
      return { success: false, error: "Блюдо пустое" };
    }

    const { error } = await supabase.from("user_meals").insert({
      user_id: userId,
      items: selectedItems,
      total_kcal: Math.round(totals.kcal),
      total_p: totals.p,
      total_f: totals.f,
      total_c: totals.c,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    set({ selectedItems: [] });

    // Сообщаем кэшу, что данные в истории устарели
    queryClient.invalidateQueries({ queryKey: ["meals-history"] });

    return { success: true, error: null };
  },

  getTotal: (): Totals => {
    return get().selectedItems.reduce(
      (acc, item) => {
        const factor = item.weight / 100;
        return {
          kcal: acc.kcal + item.kcal * factor,
          p: acc.p + item.proteins * factor,
          f: acc.f + item.fat * factor,
          c: acc.c + item.carbs * factor,
        };
      },
      { kcal: 0, p: 0, f: 0, c: 0 },
    );
  },
}));
