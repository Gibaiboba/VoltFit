"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Utensils, BarChart3, User } from "lucide-react";
import { useMealStore } from "@/store/useMealStore";

export default function StudentTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeMealType = useMealStore((state) => state.activeMealType);
  const isConstructorOpen = Boolean(activeMealType);

  const tabs = [
    { id: "/student", label: "Трекер", icon: Activity },
    { id: "/student/diary", label: "Дневник", icon: Utensils },
    { id: "/student/history", label: "История", icon: BarChart3 },
    { id: "/student/settings", label: "Профиль", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <main
        className={
          isConstructorOpen
            ? "pb-6"
            : "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-24"
        }
      >
        {children}
      </main>

      {!isConstructorOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-[calc(1.2rem+env(safe-area-inset-bottom))] md:pb-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-900/15 via-slate-900/05 to-transparent pointer-events-none -z-10" />

          <div className="w-full max-w-xs mx-auto md:max-w-4xl bg-white/[0.35] backdrop-blur-3xl border border-white rounded-[32px] shadow-[0_32px_50px_-12px_rgba(0,0,0,0.1),0_16px_24px_-8px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.02)] transition-all duration-300">
            <div className="max-w-xl mx-auto flex items-center justify-around h-14 md:h-16 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === tab.id;

                return (
                  <Link
                    key={tab.id}
                    href={tab.id}
                    prefetch={true}
                    className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 md:gap-1 transition-all group"
                  >
                    {/* Иконка */}
                    <Icon
                      className={`w-4.5 h-4.5 md:w-5 md:h-5 transition-all duration-200 ${
                        isActive
                          ? "text-[#23C55E]"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                      strokeWidth={isActive ? 2.4 : 1.8}
                    />

                    {/* Текст вкладки */}
                    <span
                      className={`text-[9px] md:text-[10px] font-bold tracking-wide transition-colors duration-200 ${
                        isActive
                          ? "text-[#23C55E]"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    >
                      {tab.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
