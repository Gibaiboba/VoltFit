import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useMealStore } from "@/store/useMealStore";
import { mealService } from "@/services/meal-service";
import { toast } from "sonner";

export const useSaveMeal = (serverToday: string) => {
  const queryClient = useQueryClient();

  // Достаем массив выбранных товаров и функцию очистки
  const { selectedItems, clearItems } = useMealStore();

  const saveMutation = useMutation({
    mutationFn: async (mealName: string) => {
      // 1. Проверка пользователя
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Пожалуйста, войдите в систему");

      // 2. Проверка на пустое блюдо перед отправкой
      if (selectedItems.length === 0) {
        throw new Error("Ваше блюдо пока пусто...");
      }

      // 3. Вызываем сервис и передаем ему чистые данные (items)
      return await mealService.saveMealWithLog(
        supabase,
        user.id,
        mealName,
        selectedItems, // Передаем продукты напрямую
        serverToday,
      );
    },
    onSuccess: () => {
      // 4. Обновляем кеш React Query
      queryClient.invalidateQueries({ queryKey: ["meals-history"] });
      queryClient.invalidateQueries({ queryKey: ["student-logs"] });
      queryClient.invalidateQueries({ queryKey: ["daily-stats"] });

      toast.success("Блюдо сохранено в историю! ✨");

      // 5. Очищаем конструктор
      clearItems();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Ошибка сохранения");
    },
  });

  return {
    // Вызываем mutate, передавая название блюда из UI
    saveMeal: (mealName: string) => saveMutation.mutate(mealName),
    isPending: saveMutation.isPending,
  };
};
