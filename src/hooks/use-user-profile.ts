import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/user";
import { useUserStore } from "@/store/useUserStore";

export function useUserProfile(passedUserId?: string) {
  // 1. Берем ID из стора, только если его не передали в аргументах
  const storeUserId = useUserStore((state) => state.user?.id);
  const userId = passedUserId || storeUserId;

  return useQuery({
    queryKey: ["student-profile", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    // Запрос сработает только если есть хоть какой-то ID
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 минут
  });
}
