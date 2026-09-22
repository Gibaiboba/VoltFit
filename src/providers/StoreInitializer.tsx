"use client";

import { useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useUserStore } from "@/store/useUserStore";

interface StoreInitializerProps {
  user: User | null;
  serverToday: string;
}

export default function StoreInitializer({
  user,
  serverToday,
}: StoreInitializerProps) {
  useEffect(() => {
    // обновляем состояние Zustand-стора сразу после монтирования компонента
    useUserStore.setState({
      user,
      selectedDate: serverToday,
    });
  }, [user, serverToday]);

  return null;
}
