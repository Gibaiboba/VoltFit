"use client";

import { useMemo, useEffect } from "react";
import { Scale, Footprints, Moon } from "lucide-react";
import { toast } from "sonner";
import { MacroCard } from "@/components/student/macro-card";
import PersonalTip from "@/components/shared/PersonalTip";
import CaloriesBanner from "@/components/student/calories-banner";
import MetricWater from "@/components/student/metric-water";
import MetricInput from "@/components/student/metric-input";
import ActivitySelector from "@/components/student/activity-selector";
import { SaveButton } from "@/components/student/save-button";
import { DateNavigation } from "@/components/student/date-navigation";
import { DashboardSkeleton } from "@/components/student/dashboard-skeleton";
import { useStudentDashboard } from "@/hooks/use-student-dashboard/index";
import { MACRO_CONFIG } from "@/constants/nutrition";
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
    if (error && history.length > 0) {
      toast.error(error, { id: "dashboard-toast-error" });
    }
  }, [error, history.length]);

  const macroStats = useMemo(
    () => [
      {
        ...MACRO_CONFIG.p,
        target: profile?.protein || 0,
        current: currentProteins || 0,
      },
      {
        ...MACRO_CONFIG.f,
        target: profile?.fat || 0,
        current: currentFats || 0,
      },
      {
        ...MACRO_CONFIG.c,
        target: profile?.carbs || 0,
        current: currentCarbs || 0,
      },
    ],
    [profile, currentProteins, currentFats, currentCarbs],
  );

  return (
    <AsyncBoundary
      isLoading={loading}
      error={error && history.length === 0 ? error : null}
      onRetry={refetch}
      skeleton={<DashboardSkeleton />}
    >
      <div className="p-6 bg-[#F4F4F5] min-h-screen pt-24 pb-44 text-slate-900">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-[40px] p-8 border border-slate-200/50 shadow-sm relative overflow-hidden animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <DateNavigation
                selectedDate={selectedDate}
                isToday={isToday}
                todayStr={todayStr}
                onDateChange={handleDateChange}
              />
            </div>

            <PersonalTip metadata={profile?.onboarding_metadata} />

            <div className="mb-8">
              <CaloriesBanner
                current={currentCalories}
                target={targetCalories}
                progress={calProgress}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {macroStats.map((m) => (
                <MacroCard key={m.label} {...m} />
              ))}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

              <SaveButton
                onClick={handleSave}
                isSaving={isSaving}
                hasLog={hasLog}
              />
            </div>
          </div>
        </div>
      </div>
    </AsyncBoundary>
  );
}
