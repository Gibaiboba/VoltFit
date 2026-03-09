import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SavedMeal } from "@/types/food";

export function useMealHistory() {
  const queryClient = useQueryClient();

  // 1. Получение данных
  const {
    data: meals = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["meals-history"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Пользователь не авторизован");

      const { data, error: dbError } = await supabase
        .from("user_meals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (dbError) throw dbError;
      return data as SavedMeal[];
    },
  });

  // 2. Удаление записи (Мутация)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_meals").delete().eq("id", id);
      if (error) throw error;
    },
    // Оптимистичное обновление или просто инвалидация кэша
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals-history"] });
    },
  });

  return {
    meals,
    isLoading,
    error,
    refetch,
    deleteMeal: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
