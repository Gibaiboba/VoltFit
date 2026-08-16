"use client";

import { createContext, useContext } from "react";

const DateContext = createContext<string>("");

export function DateProvider({
  serverToday,
  children,
}: {
  serverToday: string;
  children: React.ReactNode;
}) {
  return (
    <DateContext.Provider value={serverToday}>{children}</DateContext.Provider>
  );
}

// Удобный хук для использования даты в любом клиентском компоненте
export const useServerToday = () => useContext(DateContext);
