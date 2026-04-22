"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SavedMeal } from "@/types/food";
import { useUserStore } from "@/store/useUserStore";

export function useMealHistory(studentId?: string, selectedDate?: string) {
  const queryClient = useQueryClient();
  const currentUser = useUserStore((state) => state.user);
  const targetUserId = studentId || currentUser?.id;

  /**
   * 1. Вычисляем окно в 30 дней.
   * Это покрывает текущий день, недельную статистику и дает запас
   * для быстрого просмотра недавней истории без дозагрузок.
   */
  const safeStartDate = useMemo(() => {
    if (!selectedDate) return null;
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 30);
    return date.toISOString();
  }, [selectedDate]);

  const {
    data: meals = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    /**
     * 2. Оптимизированный queryKey.
     * Используем YYYY-MM (substring 0,7). Это значит, что если пользователь
     * кликает по разным дням ОДНОГО месяца, данные будут браться из одного кэша,
     * а не плодить 30 разных запросов.
     */
    queryKey: ["meals-history", targetUserId, selectedDate?.substring(0, 7)],
    queryFn: async () => {
      let query = supabase
        .from("user_meals")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      // 3. Запрашиваем только последние 30 дней от текущей точки
      if (safeStartDate) {
        query = query.gte("created_at", safeStartDate);
      } else {
        query = query.limit(150); // Разумный лимит, если дата не передана
      }

      const { data, error: dbError } = await query;

      if (dbError) throw dbError;
      return data as SavedMeal[];
    },
    enabled: !!targetUserId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_meals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      // 4. Инвалидируем только кэш этого пользователя
      queryClient.invalidateQueries({
        queryKey: ["meals-history", targetUserId],
      });
    },
  });

  return {
    meals,
    isLoading,
    error,
    refetch,
    deleteMeal: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
