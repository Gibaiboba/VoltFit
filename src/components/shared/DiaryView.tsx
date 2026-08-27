"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toISODate } from "@/lib/utils/date-utils";
import { useDiaryLogic } from "@/hooks/use-diary-logic";
import { useMacroStats } from "@/hooks/use-macro-stats";
import { useUserStore } from "@/store/useUserStore";
import { useMealStore } from "@/store/useMealStore";
import { DateNavigation } from "@/components/student/date-navigation";
import CaloriesBanner from "@/components/student/calories-banner";
import { MacrosComboCard } from "@/components/student/macros-combo-card";
import { DiaryMealSlot } from "@/components/food/diary-meal-slot";
import { HistorySkeleton } from "@/components/history/history-skeleton";
import AsyncBoundary from "@/components/shared/AsyncBoundary";
import { MealType } from "@/types/food";
import { MEAL_SLOTS } from "@/constants/mealTypes";
import WaterTrackerCard from "@/components/student/WaterTrackerCard";
import { ActivitySection } from "@/components/student/activity-section";
import { ActivityModal } from "@/components/student/activity-modal";
import { useActivityModalStore } from "@/store/useActivityModalStore";
import { useStudentDashboard } from "@/hooks/use-student-dashboard/index";

export default function DiaryPage() {
  const selectedDate = useUserStore((state) => state.selectedDate);
  const setSelectedDate = useUserStore((state) => state.setSelectedDate);
  const { user } = useUserStore();
  const currentUserId = user?.id || "";

  // инициализация личного дашборда активностей и модалки
  const { state: dashState, actions: dashActions } = useStudentDashboard(
    currentUserId,
    selectedDate,
  );
  const { isActivityModalOpen, closeActivityModal, openActivityModal } =
    useActivityModalStore();

  const activeMealType = useMealStore((state) => state.activeMealType);
  const setMealType = useMealStore((state) => state.setMealType);
  const loadItems = useMealStore((state) => state.loadItems);
  const clearItems = useMealStore((state) => state.clearItems);

  const todayStr = useMemo(() => toISODate(new Date()), []);

  const [expandedSlots, setExpandedSlots] = useState<Record<string, boolean>>({
    breakfast: false,
    lunch: false,
    dinner: false,
    snack: false,
  });

  // 1. Блокировка скролла
  useEffect(() => {
    document.body.style.overflow = activeMealType ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeMealType]);

  const handleCloseConstructor = useCallback(() => {
    setMealType(null);
    setExpandedSlots({
      breakfast: false,
      lunch: false,
      dinner: false,
      snack: false,
    });
  }, [setMealType]);

  // 2. Обработчик системной кнопки «Назад»
  useEffect(() => {
    const handlePopState = () => {
      if (activeMealType) {
        handleCloseConstructor();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeMealType, handleCloseConstructor]);

  const {
    displayMeals,
    allMeals,
    consumed,
    goals,
    burnedCalories,
    progress,
    isLoading,
    isFetching,
    error,
    refetch,
    deleteMeal,
    removeItem,
  } = useDiaryLogic(selectedDate, todayStr);

  // Передаем динамические цели, приходящие из useDiaryLogic
  const macroStats = useMacroStats(
    { p: goals.p || 0, f: goals.f || 0, c: goals.c || 0 },
    { p: consumed.p || 0, f: consumed.f || 0, c: consumed.c || 0 },
  );

  const daysWithData = useMemo(() => {
    if (!allMeals) return [];
    return Array.from(
      new Set(allMeals.map((m) => toISODate(new Date(m.created_at)))),
    );
  }, [allMeals]);

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
      }

      setMealType(slotId);
      window.history.pushState({ isOverlayOpen: true }, "", "");
      setExpandedSlots((prev) => ({ ...prev, [slotId]: true }));
    },
    [displayMeals, clearItems, loadItems, setMealType],
  );

  // Обработчик сохранения активности из модалки
  const handleSaveActivity = async () => {
    try {
      dashActions.handleSave();
      closeActivityModal();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="p-2 bg-[var(--background)] min-h-screen pt-18 text-slate-900 relative">
      <AsyncBoundary
        isLoading={isLoading && allMeals.length === 0}
        error={error}
        onRetry={refetch}
        skeleton={<HistorySkeleton />}
      >
        <div className="max-w-4xl mx-auto space-y-3 animate-in fade-in duration-300">
          {isFetching && allMeals.length > 0 && (
            <div className="absolute top-4 right-6 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse pointer-events-none">
              ⏳ Обновление архива...
            </div>
          )}

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <DateNavigation
                selectedDate={selectedDate}
                todayStr={todayStr}
                isToday={selectedDate === todayStr}
                onDateChange={setSelectedDate}
                daysWithData={daysWithData}
              />
            </div>
            <CaloriesBanner
              current={consumed.kcal}
              burned={burnedCalories}
              target={Math.max(0, goals.kcal - burnedCalories)}
              progress={progress}
            />
            <MacrosComboCard macros={macroStats} />
          </section>

          <section className="w-full">
            <WaterTrackerCard serverToday={todayStr} />
          </section>

          {/* секция активностей */}
          <ActivitySection
            activities={dashState.formData.activities}
            onOpenModal={openActivityModal}
          />

          <section className="space-y-2">
            <div className="px-1">
              <h2 className="text-xl mt-5 font-black text-slate-900 uppercase italic tracking-tight">
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

      {/*глобальная модалка активностей */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={closeActivityModal}
        formData={dashState.formData}
        setFormData={dashActions.setFormData}
        burnedCalories={dashState.burnedCalories}
        currentCalories={dashState.currentCalories}
        targetCalories={dashState.targetCalories}
        calProgress={dashState.calProgress}
        onSave={handleSaveActivity}
        isSaving={dashState.isSaving}
      />
    </div>
  );
}
