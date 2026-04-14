import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";
import { UserProfile } from "@/types/user";

export function useUserProfile() {
  const setProfile = useUserStore((state) => state.setProfile);

  const query = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Пользователь не авторизован");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Синхронизируем React Query со стором
  useEffect(() => {
    if (query.data) {
      setProfile(query.data);
    }
  }, [query.data, setProfile]);

  return query;
}
