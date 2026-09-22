import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";
import { studentService } from "@/services/student.service";
import { UserProfile } from "@/types/user";

/**
 * Хук для получения профиля пользователя с поддержкой серверного кэша
 * @param passedUserId - Опциональный ID (если нужно запросить чужой профиль, например, ученика)
 * @param initialData - Данные профиля, уже загруженные на сервере в MainLayout
 */
export function useUserProfile(
  passedUserId?: string,
  initialData?: UserProfile | null,
) {
  // Достаем ID из Zustand-стора, который мы заполнили на Шаге 1
  const storeUserId = useUserStore((state) => state.user?.id);
  const userId = passedUserId || storeUserId;

  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      return studentService.getProfile(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 минут данные считаются свежими и не перевызываются
    initialData: initialData, // 💡 ЕСЛИ ДАННЫЕ ПЕРЕДАНЫ С СЕРВЕРА, ЗАПРОС В СЕТЬ НЕ ПОЙДЕТ!
  });
}
