import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000 * 5, // 5 минут актуальности данных
      refetchOnWindowFocus: false,
    },
  },
});
