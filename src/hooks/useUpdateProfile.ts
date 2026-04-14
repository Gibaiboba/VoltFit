import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/user";
import { useUserStore } from "@/store/useUserStore";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!userId) throw new Error("Нет ID пользователя");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Это заставит useUserProfile сделать новый запрос и автоматически обновить Zustand
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}
