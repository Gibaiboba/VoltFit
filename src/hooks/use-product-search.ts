import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/food";

export function useProductSearch(query: string) {
  return useQuery({
    // Ключ зависит от текста запроса.
    // React Query автоматически закеширует результаты для каждого слова.
    queryKey: ["products-search", query],
    queryFn: async () => {
      const trimmed = query.trim();
      if (trimmed.length < 2) return [];

      const { data, error } = await supabase
        .from("products")
        .select("id, name, kcal, proteins, fat, carbs")
        .ilike("name", `%${trimmed}%`)
        .limit(10);

      if (error) throw error;
      return data as Product[];
    },
    // Не делать запрос, если в поиске меньше 2 символов
    enabled: query.trim().length >= 2,
    // Хранить результаты в кэше 5 минут (если пользователь сотрет и снова напишет то же слово)
    staleTime: 1000 * 60 * 5,
  });
}
