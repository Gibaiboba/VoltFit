import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Log } from "./types";
import { UserProfile } from "@/types/user";

export const useDashboardQueries = (userId: string) => {
  // Загрузка истории логов
  const logsQuery = useQuery<Log[]>({
    queryKey: ["student-logs", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .order("log_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Загрузка профиля пользователя
  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return {
    logsQuery,
    profileQuery,
    history: logsQuery.data || [],
    profile: profileQuery.data || null,
    isLoading: logsQuery.isLoading || profileQuery.isLoading,
  };
};
