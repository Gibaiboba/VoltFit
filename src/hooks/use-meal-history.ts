"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutateFunction,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SavedMeal, SelectedProduct } from "@/types/food";
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

export function useMealHistory(
  studentId?: string,
  fromDate?: string,
): UseMealHistoryReturn {
  const queryClient = useQueryClient();
  const currentUser = useUserStore((state) => state.user);
  const targetUserId = studentId || currentUser?.id;

  const queryKey = ["meals-history", targetUserId, fromDate];

  const {
    data: meals = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<SavedMeal[], Error | PostgrestError>({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from("user_meals")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: true });

      if (fromDate) {
        query = query.gte("created_at", `${fromDate}T00:00:00`);
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

  const invalidateAllHistory = () => {
    queryClient.invalidateQueries({
      queryKey: ["meals-history", targetUserId],
      exact: false,
    });
    queryClient.invalidateQueries({
      queryKey: ["student-logs-range", targetUserId],
      exact: false,
    });
    queryClient.invalidateQueries({
      queryKey: ["student-logs-infinite", targetUserId],
      exact: false,
    });
    queryClient.invalidateQueries({
      queryKey: ["daily-stats", targetUserId],
      exact: false,
    });
  };

  const deleteMutation = useMutation<
    void,
    Error,
    string,
    { previousMeals: SavedMeal[] | undefined }
  >({
    mutationFn: async (id: string) => {
      const date = getMealDate(id);
      if (!targetUserId || !date)
        throw new Error("Не удалось определить дату записи");
      await mealService.deleteMealWithLog(supabase, id, targetUserId, date);
    },
    onMutate: async (deletedMealId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousMeals = queryClient.getQueryData<SavedMeal[]>(queryKey);
      if (previousMeals) {
        queryClient.setQueryData<SavedMeal[]>(
          queryKey,
          previousMeals.filter((meal) => meal.id !== deletedMealId),
        );
      }
      return { previousMeals };
    },
    onError: (err, deletedMealId, context) => {
      if (context?.previousMeals)
        queryClient.setQueryData(queryKey, context.previousMeals);
      toast.error(err.message || "Ошибка при удалении");
    },
    onSuccess: () => {
      toast.success("Прием пищи удален");
    },
    onSettled: () => {
      invalidateAllHistory();
    },
  });

  const removeItemMutation = useMutation<
    void,
    Error,
    { mealId: string; productId: string },
    { previousMeals: SavedMeal[] | undefined }
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
    onMutate: async ({ mealId, productId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousMeals = queryClient.getQueryData<SavedMeal[]>(queryKey);

      if (previousMeals) {
        const updatedMeals = previousMeals.map((meal) => {
          if (meal.id !== mealId) return meal;

          // ТИПИЗИРОВАНО: явно приводим элементы к типу SelectedProduct для безопасного поиска
          const items = meal.items as SelectedProduct[];
          const targetItem = items.find(
            (item) => (item.id || item.food_id) === productId,
          );

          if (!targetItem) return meal;

          const itemWeight = targetItem.weight || 0;
          const factor = itemWeight / 100;

          return {
            ...meal,
            total_kcal: Math.max(0, meal.total_kcal - targetItem.kcal * factor),
            total_p: Math.max(0, meal.total_p - targetItem.proteins * factor),
            total_f: Math.max(0, meal.total_f - targetItem.fat * factor),
            total_c: Math.max(0, meal.total_c - targetItem.carbs * factor),
            items: items.filter(
              (item) => (item.id || item.food_id) !== productId,
            ),
          };
        });
        queryClient.setQueryData<SavedMeal[]>(queryKey, updatedMeals);
      }
      return { previousMeals };
    },
    onError: (err, variables, context) => {
      if (context?.previousMeals)
        queryClient.setQueryData(queryKey, context.previousMeals);
      toast.error(err.message || "Ошибка при удалении продукта");
    },
    onSuccess: () => {
      toast.success("Продукт удален");
    },
    onSettled: () => {
      invalidateAllHistory();
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
