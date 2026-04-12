import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SavedMeal } from "@/types/food";
import { useUserStore } from "@/store/useUserStore";

export function useMealHistory(studentId?: string) {
  const queryClient = useQueryClient();
  // Достаем текущего пользователя из Zustand (это синхронно и быстро)
  const currentUser = useUserStore((state) => state.user);

  const targetUserId = studentId || currentUser?.id;

  const {
    data: meals = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["meals-history", targetUserId],
    queryFn: async () => {
      const { data, error: dbError } = await supabase
        .from("user_meals")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (dbError) throw dbError;
      return data as SavedMeal[];
    },
    // Важно: не делаем запрос, пока нет ID
    enabled: !!targetUserId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_meals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals-history"] });
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
