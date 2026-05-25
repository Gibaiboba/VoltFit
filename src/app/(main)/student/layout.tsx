"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Utensils, Clock, User } from "lucide-react";

export default function StudentTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { id: "/student", label: "Трекер", icon: CalendarCheck },
    { id: "/student/diary", label: "Еда", icon: Utensils },
    { id: "/student/history", label: "История", icon: Clock },
    { id: "/student/settings", label: "Профиль", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F5]">
      <main className="pb-[calc(7rem+env(safe-area-inset-bottom))]">
        {children}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-t from-[#F4F4F5] via-[#F4F4F5]/90 to-transparent h-full pointer-events-none" />

        <div className="max-w-md mx-auto flex items-end justify-around h-28 px-6 pb-8 relative z-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.id;

            return (
              <Link
                key={tab.id}
                href={tab.id}
                prefetch={true}
                className="flex flex-col items-center gap-1.5 transition-all group"
              >
                <div
                  className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-slate-950 text-yellow-400 shadow-xl scale-110"
                      : "bg-white text-slate-500 shadow-sm border border-slate-200"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                    isActive ? "text-slate-950" : "text-slate-400"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
        {/* Хелпер безопасной зоны iOS */}
        <div className="h-[env(safe-area-inset-bottom)] bg-[#F4F4F5]" />
      </div>
    </div>
  );
}
