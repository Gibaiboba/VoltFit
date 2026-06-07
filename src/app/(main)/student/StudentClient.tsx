"use client";

import { useEffect } from "react";
import { Scale, Footprints, Moon } from "lucide-react";
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
import { ACTIVITIES_MAP } from "@/constants/activities";
import { ActivityModal } from "@/components/student/activity-modal";
import { useActivityModalStore } from "@/store/useActivityModalStore";

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

  // Показываем тост только для фоновых сбоев или ошибок мутации (сохранения)
  useEffect(() => {
    if (error && history && history.length > 0) {
      toast.error(error, { id: "dashboard-toast-error" });
    }
  }, [error, history]);

  // ИСПРАВЛЕНО: Передаем динамические цели, рассчитанные с учетом тренировки
  const macroStats = useMacroStats(
    {
      p: targetProteins || 0,
      f: targetFats || 0,
      c: targetCarbs || 0,
    },
    {
      p: currentProteins || 0,
      f: currentFats || 0,
      c: currentCarbs || 0,
    },
  );

  // Функция для сохранения прямо из модалки
  const handleSaveActivity = () => {
    try {
      handleSave();
      closeActivityModal();
    } catch (err) {
      console.error("Ошибка при сохранении активности из модалки:", err);
    }
  };

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

            <button
              onClick={openActivityModal}
              className="flex items-center justify-between w-full p-4 bg-white border border-slate-100 
             rounded-2xl shadow-sm hover:border-slate-200 hover:bg-slate-50/50 transition-all group cursor-pointer"
            >
              {/* Используем ACTIVITIES_MAP для вывода названий всех тренировок дня */}
              <div className="text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Активность дня
                </p>
                <p className="text-sm font-bold text-slate-700 line-clamp-1 max-w-[250px] sm:max-w-none">
                  {formData.activities && formData.activities.length > 0
                    ? formData.activities
                        .map((act) => {
                          const nameWithEmoji =
                            ACTIVITIES_MAP[act.activity_id]?.name ||
                            "🏋️ Тренировка";
                          // Вырезаем только текст без эмодзи для аккуратности, если нужно, либо оставляем целиком:
                          return `${nameWithEmoji.split(" ").slice(1).join(" ")} (${act.duration} мин)`;
                        })
                        .join(", ")
                    : "День без тренировок"}
                </p>
              </div>

              <span className="text-xs font-bold text-orange-500 bg-orange-50/50 px-3 py-1.5 rounded-xl group-hover:bg-orange-100 transition-colors">
                Изменить →
              </span>
            </button>

            <SaveButton
              onClick={handleSave}
              isSaving={isSaving}
              hasLog={hasLog}
            />
          </div>
        </div>
      </AsyncBoundary>

      {/* Подключаем модальное окно активности */}
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
