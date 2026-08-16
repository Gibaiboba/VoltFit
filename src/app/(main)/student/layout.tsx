"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Utensils,
  BarChart3,
  User,
  Plus,
  Dumbbell,
  Coffee,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useMealStore } from "@/store/useMealStore";
import { useActivityModalStore } from "@/store/useActivityModalStore";
import FoodConstructor from "@/components/food/food-constructor";
import { useUserStore } from "@/store/useUserStore";
import { useStudentDashboard } from "@/hooks/use-student-dashboard/index";
import { ActivityModal } from "@/components/student/activity-modal";
import { useWaterTracker } from "@/hooks/use-water-tracker";
import { useServerToday } from "@/providers/DateProvider";

export default function StudentTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Данные пользователя и выбранная дата из глобального стора
  const selectedDate = useUserStore((state) => state.selectedDate);
  const { user } = useUserStore();
  const userId = user?.id || "";

  // Инициализация хука дашборда
  const { state: dashState, actions: dashActions } = useStudentDashboard(
    userId,
    selectedDate,
  );

  const activeMealType = useMealStore((state) => state.activeMealType);
  const setMealType = useMealStore((state) => state.setMealType);
  const clearItems = useMealStore((state) => state.clearItems);

  // Zustand-стор модалки активности
  const { isActivityModalOpen, closeActivityModal, openActivityModal } =
    useActivityModalStore();

  const isConstructorOpen = Boolean(activeMealType);

  //  Извлекаем стабильную сегодняшнюю дату сервера из React Context
  const serverToday = useServerToday();

  // Передаем serverToday из контекста вместо скользящей selectedDate!
  const {
    updateWater,
    isPending,
    disabled: isWaterDisabled,
  } = useWaterTracker(serverToday);

  // Состояние быстрого меню добавления
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Списки табов для левой и правой половин панели
  const leftTabs = [
    { id: "/student/diary", label: "Дневник", icon: Utensils },
    { id: "/student", label: "Трекер", icon: Activity },
  ];

  const rightTabs = [
    { id: "/student/history", label: "История", icon: BarChart3 },
    { id: "/student/settings", label: "Профиль", icon: User },
  ];

  const handleCloseConstructor = useCallback(() => {
    setMealType(null);
  }, [setMealType]);

  const handleProgrammaticClose = useCallback(() => {
    if (window.history.state?.isOverlayOpen) {
      window.history.back();
    } else {
      handleCloseConstructor();
    }
  }, [handleCloseConstructor]);

  // Блокировка прокрутки фона для конструктора еды
  useEffect(() => {
    if (activeMealType) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeMealType]);

  // Слушатель системной кнопки "Назад"
  useEffect(() => {
    const handlePopState = () => {
      if (activeMealType) {
        handleCloseConstructor();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeMealType, handleCloseConstructor]);

  // Закрытие быстрого меню по клику вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleAddMeal = (
    slotId: "breakfast" | "lunch" | "dinner" | "snack",
  ) => {
    clearItems();
    setMealType(slotId);
    window.history.pushState({ isOverlayOpen: true }, "", "");
    setIsMenuOpen(false);
  };

  const handleAddActivity = () => {
    openActivityModal();
    setIsMenuOpen(false);
  };

  const handleFastWaterAdd = () => {
    if (isWaterDisabled || isPending) return;
    updateWater(250); // Добавляем 250 мл
    setIsMenuOpen(false);

    toast.success("Водный баланс обновлен!", {
      description: "Успешно добавлено +250 мл воды 🥛",
      duration: 3000,
    });
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
              ? "text-[#23C55E]"
              : "text-slate-400 group-hover:text-slate-600"
          }`}
          strokeWidth={isActive ? 2.4 : 1.8}
        />
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

      {/* Глобальное окно конструктора еды */}
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

      {/* Глобальное окно добавления активности */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={closeActivityModal}
        formData={dashState.formData}
        setFormData={dashActions.setFormData}
        burnedCalories={dashState.burnedCalories}
        currentCalories={dashState.currentCalories}
        targetCalories={dashState.targetCalories}
        calProgress={dashState.calProgress}
        onSave={async () => {
          dashActions.handleSave();
          closeActivityModal();
        }}
        isSaving={dashState.isSaving}
      />
      {/* Оверлей-затемнение фона при открытом меню быстрого добавления */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-40 animate-in fade-in duration-200" />
      )}

      {!isConstructorOpen && (
        <div
          ref={menuRef}
          className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-[calc(1.2rem+env(safe-area-inset-bottom))] md:pb-6"
        >
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-900/15 via-slate-900/05 to-transparent pointer-events-none -z-10" />

          {/* ВСПЛЫВАЮЩЕЕ МЕНЮ БЫСТРОГО ДОБАВЛЕНИЯ */}
          {isMenuOpen && (
            <div className="w-full max-w-xs mx-auto mb-4 bg-white/90 backdrop-blur-2xl border border-white p-4 rounded-3xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom-5 duration-300 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Быстрое добавление
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleAddMeal("breakfast")}
                  className="flex items-center gap-2 p-3 bg-amber-50/60 hover:bg-amber-50 border border-amber-100 rounded-xl transition-all group w-full text-left cursor-pointer"
                >
                  <Coffee className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-700">
                    Завтрак
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddMeal("lunch")}
                  className="flex items-center gap-2 p-3 bg-orange-50/60 hover:bg-orange-50 border border-orange-100 rounded-xl transition-all group w-full text-left cursor-pointer"
                >
                  <Sun className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-700">Обед</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddMeal("dinner")}
                  className="flex items-center gap-2 p-3 bg-blue-50/60 hover:bg-blue-50 border border-blue-100 rounded-xl transition-all group w-full text-left cursor-pointer"
                >
                  <Moon className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-700">Ужин</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddMeal("snack")}
                  className="flex items-center gap-2 p-3 bg-purple-50/60 hover:bg-purple-50 border border-purple-100 rounded-xl transition-all group w-full text-left cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-700">
                    Перекус
                  </span>
                </button>
              </div>

              {/* Сетка кнопок действий */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleAddActivity}
                  className="flex items-center justify-center gap-2 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm transition-all group cursor-pointer"
                >
                  <Dumbbell className="w-4 h-4 text-emerald-100 group-hover:rotate-12 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Trenirovka
                  </span>
                </button>

                {/* Кнопка мгновенного добавления +250мл */}
                <button
                  type="button"
                  disabled={isWaterDisabled || isPending}
                  onClick={handleFastWaterAdd}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-sm transition-all group cursor-pointer disabled:opacity-60"
                >
                  <span className="text-sm group-hover:scale-110 transition-transform">
                    🥛
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider">
                    Вода +250
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* НАВИГАЦИОННАЯ ПАНЕЛЬ С КНОПКОЙ ПО ЦЕНТРУ */}
          <div className="w-full max-w-sm mx-auto md:max-w-4xl bg-white/[0.35] backdrop-blur-3xl border border-white rounded-[32px] shadow-[0_32px_50px_-12px_rgba(0,0,0,0.1),0_16px_24px_-8px_rgba(0,0,0,0.05)] transition-all duration-300">
            <div className="flex items-center justify-between h-14 md:h-16 px-4">
              {/* Левые вкладки */}
              <div className="flex items-center justify-around flex-1 h-full">
                {leftTabs.map(renderTab)}
              </div>

              {/* Центральная кнопка Плюс */}
              <div className="relative -top-3 px-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
                    isMenuOpen
                      ? "bg-slate-800 text-white rotate-45 scale-90"
                      : "bg-[#23C55E] text-white hover:bg-[#1fae52] hover:scale-105 shadow-[#23C55E]/20"
                  }`}
                >
                  <Plus className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              {/* Правые вкладки */}
              <div className="flex items-center justify-around flex-1 h-full">
                {rightTabs.map(renderTab)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
