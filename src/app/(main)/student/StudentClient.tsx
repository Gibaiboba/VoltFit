"use client";

import { useEffect } from "react";
import { Scale, Footprints, Moon } from "lucide-react";
import { toast } from "sonner";
import PersonalTip from "@/components/shared/PersonalTip";
import { CaloriesMacrosComboCard } from "@/components/student/calories-macros-combo-card";
import { ActivitySection } from "@/components/student/activity-section";
import MetricWater from "@/components/student/metric-water";
import MetricInput from "@/components/student/metric-input";
import { SaveButton } from "@/components/student/save-button";
import { DateNavigation } from "@/components/student/date-navigation";
import { DashboardSkeleton } from "@/components/student/dashboard-skeleton";
import { useStudentDashboard } from "@/hooks/use-student-dashboard/index";
import { useMacroStats } from "@/hooks/use-macro-stats";
import AsyncBoundary from "@/components/shared/AsyncBoundary";
import { useUserStore } from "@/store/useUserStore";
import { ActivityModal } from "@/components/student/activity-modal";
import { useActivityModalStore } from "@/store/useActivityModalStore";
import { useDailyLogValidation } from "@/hooks/use-daily-log-validation";

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
  const { isActivityModalOpen, closeActivityModal, openActivityModal } =
    useActivityModalStore();
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
    burnedCalories,
    targetProteins,
    targetFats,
    targetCarbs,
  } = state;

  const {
    handleDateChange,
    handleSave,
    setFormData,
    addWater,
    removeWater,
    refetch,
  } = actions;

  // сложная логика валидации и дебаунса здесь
  const {
    fieldErrors,
    setFieldErrors,
    handleFieldChange,
    handleAddWaterWithLimit,
    handleRemoveWaterWithLimit,
    isFormInvalid,
  } = useDailyLogValidation({
    formData,
    setFormData,
    addWater,
    removeWater,
  });

  // Тосты ошибок связи
  useEffect(() => {
    if (error && history && history.length > 0) {
      toast.error(error, { id: "dashboard-toast-error" });
    }
  }, [error, history]);

  // сбрасываем ошибки из хука при переключении дней
  const onWrappedDateChange = (date: string) => {
    setFieldErrors({});
    handleDateChange(date);
  };

  const macroStats = useMacroStats(
    { p: targetProteins || 0, f: targetFats || 0, c: targetCarbs || 0 },
    { p: currentProteins || 0, f: currentFats || 0, c: currentCarbs || 0 },
  );

  const handleSaveActivity = () => {
    try {
      handleSave();
      closeActivityModal();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-2 bg-[var(--background)] min-h-screen pt-20 text-slate-900">
      <AsyncBoundary
        isLoading={loading}
        error={error && history && history.length === 0 ? error : null}
        onRetry={refetch}
        skeleton={<DashboardSkeleton />}
      >
        <div className="max-w-4xl mx-auto space-y-2 sm:space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <DateNavigation
              selectedDate={selectedDate}
              isToday={isToday}
              todayStr={todayStr}
              onDateChange={onWrappedDateChange}
            />
          </div>

          <CaloriesMacrosComboCard
            current={currentCalories}
            target={targetCalories}
            progress={calProgress}
            macros={macroStats}
            burnedCalories={burnedCalories}
          />

          <ActivitySection
            activities={formData.activities}
            onOpenModal={openActivityModal}
          />

          <div className="space-y-2 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <MetricWater
                value={formData.water}
                onAdd={handleAddWaterWithLimit}
                onRemove={handleRemoveWaterWithLimit}
                error={fieldErrors.water}
              />

              <MetricInput
                title="Шаги"
                icon={Footprints}
                color="green"
                value={formData.steps}
                footer={`Цель: ${profile?.steps_goal || "10 000"} шагов`}
                onChange={(v) => handleFieldChange("steps", v)}
                error={fieldErrors.steps}
              />
              <MetricInput
                title="Вес"
                icon={Scale}
                color="orange"
                value={formData.weight}
                footer={`Предыдущий вес: ${previousWeight || "—"} кг`}
                onChange={(v) => handleFieldChange("weight", v)}
                error={fieldErrors.weight}
              />
              <MetricInput
                title="Сон"
                icon={Moon}
                color="blue"
                value={formData.sleep_hours}
                suffix="ч"
                onChange={(v) => handleFieldChange("sleep_hours", v)}
                error={fieldErrors.sleep_hours}
              />
            </div>

            <PersonalTip metadata={profile?.onboarding_metadata} />

            <div
              className={isFormInvalid ? "opacity-30 pointer-events-none" : ""}
            >
              <SaveButton
                onClick={handleSave}
                isSaving={isSaving}
                hasLog={hasLog}
              />
            </div>
          </div>
        </div>
      </AsyncBoundary>

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={closeActivityModal}
        formData={formData}
        setFormData={setFormData}
        burnedCalories={burnedCalories}
        currentCalories={currentCalories}
        targetCalories={targetCalories}
        calProgress={calProgress}
        onSave={handleSaveActivity}
        isSaving={isSaving}
      />
    </div>
  );
}
