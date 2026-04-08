import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/store/useUserStore";

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      // 1. Получаем текущую сессию (id пользователя)
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Пользователь не авторизован");

      // 2. Тянем данные профиля из таблицы profiles
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      return data as UserProfile;
    },
    // Данные профиля меняются редко, поэтому помечаем их "свежими" на 5 минут
    staleTime: 1000 * 60 * 5,
    // В случае ошибки (например, пропал интернет) пробуем еще раз 1 раз
    retry: 1,
  });
}
