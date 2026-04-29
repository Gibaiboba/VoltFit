"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useMealStore } from "@/store/useMealStore";
import { mealService } from "@/services/meal-service";
import { toast } from "sonner";

export const useSaveMeal = (serverToday: string) => {
  const queryClient = useQueryClient();

  // Достаем все необходимые данные из стора
  const {
    selectedItems,
    activeMealType,
    activeMealId, // Это ID существующей записи из БД (если редактируем)
    clearItems,
  } = useMealStore();

  const saveMutation = useMutation({
    mutationFn: async (mealName: string) => {
      // 1. Проверка авторизации
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Пожалуйста, войдите в систему");

      // 2. Валидация перед отправкой
      if (selectedItems.length === 0) {
        throw new Error("Ваше блюдо пока пусто...");
      }

      if (!activeMealType) {
        throw new Error("Не выбран тип приема пищи (завтрак/обед...)");
      }

      // 3. Вызов сервиса с поддержкой upsert (создание или обновление)
      return await mealService.saveMealWithLog(
        supabase,
        user.id,
        mealName,
        selectedItems,
        serverToday,
        activeMealType,
        activeMealId, // Передаем ID: если он есть, сервис обновит старую запись
      );
    },
    onSuccess: () => {
      // 4. Инвалидация кэша для мгновенного обновления UI
      // Обновляем историю приемов пищи
      queryClient.invalidateQueries({ queryKey: ["meals-history"] });
      // Обновляем логи (если они используются в других местах)
      queryClient.invalidateQueries({ queryKey: ["student-logs"] });
      // Обновляем общую статистику за день (калории и т.д.)
      queryClient.invalidateQueries({ queryKey: ["daily-stats"] });

      toast.success("Данные успешно сохранены! ✨");

      // 5. Очищаем черновик в сторе
      clearItems();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Ошибка сохранения");
    },
  });

  return {
    // Метод для вызова сохранения
    saveMeal: (mealName: string) => saveMutation.mutate(mealName),
    // Статус загрузки для блокировки кнопок
    isPending: saveMutation.isPending,
  };
};
