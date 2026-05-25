"use client";

import { useState, useMemo, useCallback } from "react";
import { toISODate } from "@/lib/utils/date-utils";
import { useDiaryLogic } from "@/hooks/use-diary-logic";
import { useMacroStats } from "@/hooks/use-macro-stats";
import { useUserStore } from "@/store/useUserStore";
import { useMealStore } from "@/store/useMealStore";
import { DateNavigation } from "@/components/student/date-navigation";
import CaloriesBanner from "@/components/student/calories-banner";
import { MacrosComboCard } from "@/components/student/macros-combo-card";
import FoodConstructor from "@/components/food/food-constructor";
import { DiaryMealSlot } from "@/components/food/diary-meal-slot";
import { HistorySkeleton } from "@/components/history/history-skeleton";
import AsyncBoundary from "@/components/shared/AsyncBoundary";
import { MealType } from "@/types/food";
import { MEAL_SLOTS } from "@/constants/mealTypes";

export default function DiaryPage() {
  const selectedDate = useUserStore((state) => state.selectedDate);
  const setSelectedDate = useUserStore((state) => state.setSelectedDate);

  const activeMealType = useMealStore((state) => state.activeMealType);
  const setMealType = useMealStore((state) => state.setMealType);
  const loadItems = useMealStore((state) => state.loadItems);
  const clearItems = useMealStore((state) => state.clearItems);

  const todayStr = useMemo(() => toISODate(new Date()), []);

  // Состояние открытых аккордеонов для каждого слота
  const [expandedSlots, setExpandedSlots] = useState<Record<string, boolean>>({
    breakfast: false,
    lunch: false,
    dinner: false,
    snack: false,
  });

  // Бизнес-логика данных (с умным квантованием архивных дат)
  const {
    displayMeals,
    allMeals,
    consumed,
    goals,
    progress,
    isLoading,
    isFetching,
    error,
    refetch,
    deleteMeal,
    removeItem,
  } = useDiaryLogic(selectedDate, todayStr);

  // Оптимизированный расчет макросов
  const macroStats = useMacroStats(goals, consumed);

  // Вычисляем дни, в которых есть записи
  const daysWithData = useMemo(() => {
    if (!allMeals) return [];
    return Array.from(
      new Set(allMeals.map((m) => toISODate(new Date(m.created_at)))),
    );
  }, [allMeals]);

  // Ссылочно-стабильные методы управления аккордеонами
  const toggleSlot = useCallback((slotId: string) => {
    setExpandedSlots((prev) => ({ ...prev, [slotId]: !prev[slotId] }));
  }, []);

  const closeSlot = useCallback((slotId: string) => {
    setExpandedSlots((prev) => ({ ...prev, [slotId]: false }));
  }, []);

  const handlePlusClick = useCallback(
    (slotId: MealType) => (e: React.MouseEvent) => {
      e.stopPropagation();
      clearItems();

      const existing = displayMeals[slotId];

      if (existing) {
        loadItems(existing.items, slotId, existing.id);
      } else {
        setMealType(slotId);
      }

      setExpandedSlots((prev) => ({ ...prev, [slotId]: true }));
    },
    [displayMeals, clearItems, loadItems, setMealType],
  );

  return (
    <AsyncBoundary
      isLoading={isLoading && allMeals.length === 0}
      error={error}
      onRetry={refetch}
      skeleton={<HistorySkeleton />}
    >
      <div className="mt-24 max-w-4xl mx-auto p-6 lg:p-8 space-y-8 relative text-slate-900">
        {/* Индикатор фонового обновления архива */}
        {isFetching && allMeals.length > 0 && (
          <div className="absolute top-4 right-6 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse pointer-events-none">
            ⏳ Обновление архива...
          </div>
        )}

        {/* ВЕРХНЯЯ СЕКЦИЯ: Навигация по датам */}
        <section className="space-y-6">
          <div className="flex justify-center w-full">
            <div className="w-full md:w-auto flex justify-center">
              <DateNavigation
                selectedDate={selectedDate}
                todayStr={todayStr}
                isToday={selectedDate === todayStr}
                onDateChange={setSelectedDate}
                daysWithData={daysWithData}
              />
            </div>
          </div>

          {/* Статистика калорий и БЖУ за день */}
          <CaloriesBanner
            current={consumed.kcal}
            target={goals.kcal}
            progress={progress}
          />
          <MacrosComboCard macros={macroStats} />
        </section>

        {/* ПОЛНОЭКРАННЫЙ ОВЕРЛЕЙ КОНСТРУКТОРА */}
        {activeMealType && (
          <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="max-w-6xl mx-auto p-4 md:p-12 pb-32">
              <FoodConstructor serverToday={selectedDate} />
            </div>
          </div>
        )}

        {/* СПИСОК СЛОТОВ ПРИЕМА ПИЩИ (АККОРДЕОНЫ) */}
        <section className="space-y-4">
          <div className="px-2">
            <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">
              Дневной рацион
            </h2>
          </div>

          {MEAL_SLOTS.map((slot) => (
            <DiaryMealSlot
              key={slot.id}
              slot={slot}
              savedMeal={displayMeals[slot.id]}
              isExpanded={!!expandedSlots[slot.id]}
              isFormActiveForThisSlot={activeMealType === slot.id}
              onToggle={toggleSlot}
              onPlusClick={handlePlusClick(slot.id)}
              onRemoveItem={removeItem}
              onDeleteMeal={deleteMeal}
              onCloseSlot={closeSlot}
            />
          ))}
        </section>
      </div>
    </AsyncBoundary>
  );
}
