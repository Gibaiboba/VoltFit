"use client";

import { useEffect } from "react";
import { Scale, Footprints, Moon } from "lucide-react";
import { toast } from "sonner";
import { MacrosComboCard } from "@/components/student/macros-combo-card";
import PersonalTip from "@/components/shared/PersonalTip";
import CaloriesBanner from "@/components/student/calories-banner";
import MetricWater from "@/components/student/metric-water";
import MetricInput from "@/components/student/metric-input";
import ActivitySelector from "@/components/student/activity-selector";
import { SaveButton } from "@/components/student/save-button";
import { DateNavigation } from "@/components/student/date-navigation";
import { DashboardSkeleton } from "@/components/student/dashboard-skeleton";
import { useStudentDashboard } from "@/hooks/use-student-dashboard/index";
import { useMacroStats } from "@/hooks/use-macro-stats"; // ИСПРАВЛЕНО: Импортируем наш хук
import AsyncBoundary from "@/components/shared/AsyncBoundary";
import { useUserStore } from "@/store/useUserStore";

interface StudentClientProps {
  userId: string;
  serverToday: string;
}

export default function StudentClient({
  userId,
  serverToday,
}: StudentClientProps) {
  const { state, actions } = useStudentDashboard(userId, serverToday);
  const { selectedDate } = useUserStore();

  const {
    loading,
    error,
    formData,
    isToday,
    hasLog,
    currentCalories,
    currentProteins,
    currentFats,
    currentCarbs,
    targetCalories,
    calProgress,
    history,
    profile,
    isSaving,
    todayStr,
    previousWeight,
  } = state;

  const {
    handleDateChange,
    handleSave,
    setFormData,
    addWater,
    removeWater,
    refetch,
  } = actions;

  // Показываем тост только для фоновых сбоев или ошибок мутации (сохранения)
  useEffect(() => {
    if (error && history && history.length > 0) {
      toast.error(error, { id: "dashboard-toast-error" });
    }
  }, [error, history]);

  const macroStats = useMacroStats(
    { p: profile?.protein || 0, f: profile?.fat || 0, c: profile?.carbs || 0 },
    { p: currentProteins || 0, f: currentFats || 0, c: currentCarbs || 0 },
  );

  return (
    <AsyncBoundary
      isLoading={loading}
      error={error && history && history.length === 0 ? error : null}
      onRetry={refetch}
      skeleton={<DashboardSkeleton />}
    >
      {/* Главная серая подложка страницы */}
      <div className="p-6 bg-[#F4F4F5] min-h-screen pt-24 pb-44 text-slate-900 animate-in fade-in duration-300">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Навигация дат */}
          <div className="flex items-center justify-between">
            <DateNavigation
              selectedDate={selectedDate}
              isToday={isToday}
              todayStr={todayStr}
              onDateChange={handleDateChange}
            />
          </div>
          {/* Баннер калорий */}
          <div>
            <CaloriesBanner
              current={currentCalories}
              target={targetCalories}
              progress={calProgress}
            />
          </div>
          {/* Макронутриенты */}

          <MacrosComboCard macros={macroStats} />

          {/* Сетка метрик, активность и кнопка */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricWater
                value={formData.water}
                onAdd={addWater}
                onRemove={removeWater}
              />
              <MetricInput
                title="Вес"
                icon={Scale}
                color="orange"
                value={formData.weight}
                footer={`Пред: ${previousWeight || "—"}`}
                onChange={(v) => setFormData({ weight: v })}
              />
              <MetricInput
                title="Шаги"
                icon={Footprints}
                color="green"
                value={formData.steps}
                footer={`Цель: ${profile?.steps_goal || "10 000"}`}
                onChange={(v) => setFormData({ steps: v })}
              />
              <MetricInput
                title="Сон"
                icon={Moon}
                color="blue"
                value={formData.sleep_hours}
                suffix="ч"
                onChange={(v) => setFormData({ sleep_hours: v })}
              />
            </div>

            <ActivitySelector
              value={formData.activity_level}
              onChange={(v) => setFormData({ activity_level: v })}
            />

            <PersonalTip metadata={profile?.onboarding_metadata} />

            <SaveButton
              onClick={handleSave}
              isSaving={isSaving}
              hasLog={hasLog}
            />
          </div>
        </div>
      </div>
    </AsyncBoundary>
  );
}
