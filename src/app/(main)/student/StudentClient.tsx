"use client";

import { useEffect } from "react";
import { Scale, Footprints, Moon, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { MacrosComboCard } from "@/components/student/macros-combo-card";
import PersonalTip from "@/components/shared/PersonalTip";
import CaloriesBanner from "@/components/student/calories-banner";
import MetricWater from "@/components/student/metric-water";
import MetricInput from "@/components/student/metric-input";
import { SaveButton } from "@/components/student/save-button";
import { DateNavigation } from "@/components/student/date-navigation";
import { DashboardSkeleton } from "@/components/student/dashboard-skeleton";
import { useStudentDashboard } from "@/hooks/use-student-dashboard/index";
import { useMacroStats } from "@/hooks/use-macro-stats";
import AsyncBoundary from "@/components/shared/AsyncBoundary";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";
import { ACTIVITIES_MAP } from "@/constants/activities";

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
    /* Внешний контейнер со стабильными отступами вынесен за пределы AsyncBoundary */
    <div className="p-6 bg-[#F4F4F5] min-h-screen pt-24 text-slate-900">
      <AsyncBoundary
        isLoading={loading}
        error={error && history && history.length === 0 ? error : null}
        onRetry={refetch}
        skeleton={<DashboardSkeleton />}
      >
        {/* Анимация появления применяется только к загруженному контенту */}
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
          {/* Навигация дат */}
          <div className="flex items-center justify-between">
            <DateNavigation
              selectedDate={selectedDate}
              isToday={isToday}
              todayStr={todayStr}
              onDateChange={handleDateChange}
            />
          </div>

          <PersonalTip metadata={profile?.onboarding_metadata} />

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

            <Link
              href={`/student/activity?date=${selectedDate}`}
              className="flex items-center justify-between w-full p-4 bg-white border border-slate-100 
             rounded-2xl shadow-sm hover:border-slate-200 hover:bg-slate-50/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl group-hover:scale-105 transition-transform">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Активность дня
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {formData.selected_activity_id &&
                    ACTIVITIES_MAP[formData.selected_activity_id]
                      ? `${ACTIVITIES_MAP[formData.selected_activity_id].name} (${formData.activity_duration} мин)`
                      : "День без тренировок"}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-500 bg-orange-50/50 px-3 py-1.5 rounded-xl group-hover:bg-orange-100 transition-colors">
                Изменить →
              </span>
            </Link>

            <SaveButton
              onClick={handleSave}
              isSaving={isSaving}
              hasLog={hasLog}
            />
          </div>
        </div>
      </AsyncBoundary>
    </div>
  );
}
