"use client";

import { useState } from "react";
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
  // Функция внутри useState в React выполняется один раз
  // при создании компонента — и на сервере, и на клиенте.
  useState(() => {
    useUserStore.setState({
      user,
      selectedDate: serverToday,
    });
    return true;
  });

  return null;
}
