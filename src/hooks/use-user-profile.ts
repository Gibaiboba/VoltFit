import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";
import { studentService } from "@/services/student.service";

export function useUserProfile(passedUserId?: string) {
  const storeUserId = useUserStore((state) => state.user?.id);
  const userId = passedUserId || storeUserId;

  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      return studentService.getProfile(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // Оставляем 30 минут
  });
}
