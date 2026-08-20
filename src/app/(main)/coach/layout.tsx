"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Utensils, User, Plus } from "lucide-react";
import { useMealStore } from "@/store/useMealStore";
import FoodConstructor from "@/components/food/food-constructor";
import { useUserStore } from "@/store/useUserStore";

export default function CoachTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const selectedDate = useUserStore((state) => state.selectedDate);

  const activeMealType = useMealStore((state) => state.activeMealType);
  const setMealType = useMealStore((state) => state.setMealType);
  const clearItems = useMealStore((state) => state.clearItems);

  const isConstructorOpen = Boolean(activeMealType);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // У ТРЕНЕРА него всего 3 вкладки, плюс делит их по центру
  const leftTabs = [
    { id: "/coach", label: "Ученики", icon: Users },
    { id: "/coach/diary", label: "Дневник", icon: Utensils },
  ];

  const rightTabs = [
    { id: "/coach/settings", label: "Профиль", icon: User },
    // Вкладка истории тренеру, оставляем пустое место для симметрии
  ];

  const handleCloseConstructor = useCallback(
    () => setMealType(null),
    [setMealType],
  );
  const handleProgrammaticClose = useCallback(() => {
    if (window.history.state?.isOverlayOpen) window.history.back();
    else handleCloseConstructor();
  }, [handleCloseConstructor]);

  useEffect(() => {
    document.body.style.overflow = activeMealType ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeMealType]);

  const handleAddMeal = (
    slotId: "breakfast" | "lunch" | "dinner" | "snack",
  ) => {
    clearItems();
    setMealType(slotId);
    window.history.pushState({ isOverlayOpen: true }, "", "");
    setIsMenuOpen(false);
  };

  const renderTab = (tab: (typeof leftTabs)[number]) => {
    const Icon = tab.icon;
    const isActive = pathname === tab.id;

    return (
      <Link
        key={tab.id}
        href={tab.id}
        prefetch={true}
        className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 md:gap-1 transition-all group"
      >
        <Icon
          className={`w-4.5 h-4.5 md:w-5 md:h-5 transition-all duration-200 ${
            isActive
              ? "text-blue-600"
              : "text-slate-400 group-hover:text-slate-600"
          }`}
          strokeWidth={isActive ? 2.4 : 1.8}
        />
        <span
          className={`text-[9px] md:text-[10px] font-bold tracking-wide transition-colors duration-200 ${
            isActive
              ? "text-blue-600"
              : "text-slate-400 group-hover:text-slate-600"
          }`}
        >
          {tab.label}
        </span>
      </Link>
    );
  };

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

      {/* Глобальный конструктор еды тренера */}
      {activeMealType && (
        <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="max-w-6xl mx-auto p-4 md:p-8 pb-20">
            <FoodConstructor
              serverToday={selectedDate}
              onClose={handleProgrammaticClose}
            />
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-40 animate-in fade-in" />
      )}

      {!isConstructorOpen && (
        <div
          ref={menuRef}
          className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-[calc(1.2rem+env(safe-area-inset-bottom))] md:pb-6"
        >
          {/* Быстрое меню тренера (Только еда, БЕЗ КНОПКИ АКТИВНОСТИ) */}
          {isMenuOpen && (
            <div className="w-full max-w-xs mx-auto mb-4 bg-white/90 backdrop-blur-2xl border border-white p-4 rounded-3xl shadow-xl space-y-3 animate-in slide-in-from-bottom-5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Питание тренера
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAddMeal("breakfast")}
                  className="flex items-center gap-2 p-3 bg-amber-50/60 rounded-xl text-xs font-bold text-slate-700"
                >
                  Завтрак
                </button>
                <button
                  onClick={() => handleAddMeal("lunch")}
                  className="flex items-center gap-2 p-3 bg-orange-50/60 rounded-xl text-xs font-bold text-slate-700"
                >
                  Обед
                </button>
                <button
                  onClick={() => handleAddMeal("dinner")}
                  className="flex items-center gap-2 p-3 bg-blue-50/60 rounded-xl text-xs font-bold text-slate-700"
                >
                  Ужин
                </button>
                <button
                  onClick={() => handleAddMeal("snack")}
                  className="flex items-center gap-2 p-3 bg-purple-50/60 rounded-xl text-xs font-bold text-slate-700"
                >
                  Перекус
                </button>
              </div>
            </div>
          )}

          {/* ПАНЕЛЬ НАВИГАЦИИ ТРЕНЕРА */}
          <div className="w-full max-w-sm mx-auto bg-white/[0.35] backdrop-blur-3xl border border-white rounded-[32px] shadow-lg">
            <div className="flex items-center justify-between h-14 px-4">
              <div className="flex items-center justify-around flex-1 h-full">
                {leftTabs.map(renderTab)}
              </div>

              {/* ПЛЮС ДЛЯ ТРЕНЕРА */}
              <div className="relative -top-3 px-2 shrink-0">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                    isMenuOpen
                      ? "bg-slate-800 text-white rotate-45 scale-90"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
                  }`}
                >
                  <Plus className="w-6 h-6" strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex items-center justify-around flex-1 h-full">
                {rightTabs.map(renderTab)}
                {/* Пустая заглушка справа для идеальной симметрии сетки вокруг плюса */}
                <div className="flex-1 h-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
