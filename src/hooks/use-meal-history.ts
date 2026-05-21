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
import { toISODate } from "@/lib/utils/date-utils";

interface UseMealHistoryReturn {
  meals: SavedMeal[];
  isLoading: boolean;
  isFetching: boolean;
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

// ИСПРАВЛЕНО: Теперь хук принимает вторым аргументом необязательную дату фильтрации
export function useMealHistory(
  studentId?: string,
  fromDate?: string,
): UseMealHistoryReturn {
  const queryClient = useQueryClient();
  const currentUser = useUserStore((state) => state.user);
  const targetUserId = studentId || currentUser?.id;

  // 1. Получаем данные с учетом временного окна
  const {
    data: meals = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<SavedMeal[], Error | PostgrestError>({
    // ИСПРАВЛЕНО: Добавили fromDate в queryKey, чтобы React Query знал о диапазоне кэша
    queryKey: ["meals-history", targetUserId, fromDate],
    queryFn: async () => {
      let query = supabase
        .from("user_meals")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: true });

      // ИСПРАВЛЕНО: Если дата передана, запрашиваем записи только ОТ этой даты (gte)
      if (fromDate) {
        query = query.gte("created_at", fromDate);
      }

      const { data, error: dbError } = await query;

      if (dbError) throw dbError;
      return data as SavedMeal[];
    },
    enabled: !!targetUserId,
  });

  const getMealDate = (mealId: string): string | null => {
    const meal = meals.find((m) => m.id === mealId);
    return meal?.created_at ? toISODate(new Date(meal.created_at)) : null;
  };

  // 2. Удаление приема пищи целиком
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const date = getMealDate(id);
      if (!targetUserId || !date)
        throw new Error("Не удалось определить дату записи");

      await mealService.deleteMealWithLog(supabase, id, targetUserId, date);
    },
    onSuccess: () => {
      // ИСПРАВЛЕНО: Инвалидируем кэш с учетом переданной даты
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

  // 3. Удаление одного продукта из приема пищи
  const removeItemMutation = useMutation<
    void,
    Error,
    { mealId: string; productId: string }
  >({
    mutationFn: async ({ mealId, productId }) => {
      const date = getMealDate(mealId);
      if (!targetUserId || !date)
        throw new Error("Не удалось определить дату записи");

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
    isFetching,
    error: (error as Error) || null,
    refetch,
    deleteMeal: deleteMutation.mutate,
    removeItem: removeItemMutation.mutate,
    isProcessing: deleteMutation.isPending || removeItemMutation.isPending,
  };
}
