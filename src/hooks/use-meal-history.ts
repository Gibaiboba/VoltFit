"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutateFunction,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SavedMeal } from "@/types/food";
import { useUserStore } from "@/store/useUserStore";
import { mealService } from "@/services/meal-service";
import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";

// Интерфейс для результата хука (помогает IDE и делает код чище)
interface UseMealHistoryReturn {
  meals: SavedMeal[];
  isLoading: boolean;
  error: Error | PostgrestError | null;
  refetch: () => void;
  deleteMeal: UseMutateFunction<void, Error, string, unknown>;
  removeItem: UseMutateFunction<
    void,
    Error,
    { mealId: string; productId: string },
    unknown
  >;
  isProcessing: boolean;
}

export function useMealHistory(
  studentId?: string,
  selectedDate?: string,
): UseMealHistoryReturn {
  const queryClient = useQueryClient();
  const currentUser = useUserStore((state) => state.user);
  const targetUserId = studentId || currentUser?.id;

  // 1. Получаем данные
  const {
    data: meals = [],
    isLoading,
    error,
    refetch,
  } = useQuery<SavedMeal[], Error | PostgrestError>({
    queryKey: ["meals-history", targetUserId, selectedDate?.substring(0, 7)],
    queryFn: async () => {
      const { data, error: dbError } = await supabase
        .from("user_meals")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: true });

      if (dbError) throw dbError;
      return data as SavedMeal[];
    },
    enabled: !!targetUserId,
  });

  const getEffectiveDate = (mealId: string): string | null => {
    if (selectedDate) return selectedDate;
    const meal = meals.find((m) => m.id === mealId);
    return meal?.created_at ? meal.created_at.split("T")[0] : null;
  };

  // 2. Удаление приема пищи
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const date = getEffectiveDate(id);
      if (!targetUserId || !date) throw new Error("Дата не определена");

      await mealService.deleteMealWithLog(supabase, id, targetUserId, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["meals-history", targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ["student-logs", targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ["daily-stats", targetUserId],
      });
      toast.success("Прием пищи удален");
    },
    onError: (err) => {
      toast.error(err.message || "Ошибка при удалении");
    },
  });

  // 3. Удаление одного продукта
  const removeItemMutation = useMutation<
    void,
    Error,
    { mealId: string; productId: string }
  >({
    mutationFn: async ({ mealId, productId }) => {
      const date = getEffectiveDate(mealId);
      if (!targetUserId || !date) throw new Error("Дата не определена");

      await mealService.removeItemFromMeal(
        supabase,
        mealId,
        productId,
        targetUserId,
        date,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["meals-history", targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ["student-logs", targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ["daily-stats", targetUserId],
      });
      toast.success("Продукт удален");
    },
    onError: (err) => {
      toast.error(err.message || "Ошибка при удалении продукта");
    },
  });

  return {
    meals,
    isLoading,
    error: (error as Error) || null,
    refetch,
    deleteMeal: deleteMutation.mutate,
    removeItem: removeItemMutation.mutate,
    isProcessing: deleteMutation.isPending || removeItemMutation.isPending,
  };
}
