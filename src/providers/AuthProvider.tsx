"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    // Данные уже лежат в сторе благодаря StoreInitializer
    // Оставляем ТОЛЬКО прослушивание живых событий авторизации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        clearUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, clearUser]);

  return <>{children}</>;
}
