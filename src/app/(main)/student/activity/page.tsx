"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useStudentDashboard } from "@/hooks/use-student-dashboard/index";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { ACTIVITIES_MAP } from "@/constants/activities";
import { ArrowLeft, Check, Flame } from "lucide-react";
import CaloriesBanner from "@/components/student/calories-banner";

export default function ActivityPage({
  params,
}: {
  params: { userId: string };
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Достаем данные из онбординга
  const onboardingData = useOnboardingStore((state) => state.data);
  const userWeight = Number(onboardingData?.weight) || 70;
  const userGender = onboardingData?.gender || "female";

  const dateFromUrl =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  const { state, actions } = useStudentDashboard(params.userId, dateFromUrl);
  const {
    formData,
    targetCalories,
    currentCalories,
    calProgress,
    isSaving,
    burnedCalories,
  } = state;
  const { setFormData, handleSave } = actions;

  // Безопасное чтение текущих значений из формы
  const selectedActivityId = formData.selected_activity_id || "";
  const durationMin = Number(formData.activity_duration) || 0;

  // 2. ИСПРАВЛЕНО: handleSave теперь выполняется асинхронно, предотвращая блокировку UI роутером
  const handleSaveAndBack = async () => {
    if (!selectedActivityId || durationMin <= 0) return;

    try {
      // Хук handleSave сам соберет актуальные selected_activity_id и activity_duration из formData
      await handleSave();
      router.push("/student"); // Перенаправляем строго ПОСЛЕ успешной инициализации отправки
    } catch (error) {
      console.error("Ошибка при сохранении активности:", error);
    }
  };

  return (
    <div className="p-6 bg-[#F4F4F5] min-h-screen pt-24 text-slate-900 max-w-xl mx-auto space-y-6">
      {/* Кнопка назад */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="w-4 h-4" /> Назад на дашборд
      </button>

      {/* Интерактивный предпросмотр калорий */}
      {/* ИСПРАВЛЕНО: убрали дублирующее сложение targetCalories + burnedCalories */}
      <CaloriesBanner
        current={currentCalories}
        target={targetCalories}
        progress={calProgress}
      />

      {/* Контейнер формы */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-800">
          Добавить активность
        </h2>

        {/* Информация о пользователе */}
        <p className="text-xs text-slate-400">
          Расчет производится для параметров:{" "}
          <span className="font-semibold">{userWeight} кг</span>,{" "}
          {userGender === "female" ? "женский пол" : "мужской пол"}.
        </p>

        {/* Выпадающий список всех активностей */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Вид тренировки
          </label>
          <select
            value={selectedActivityId}
            onChange={(e) =>
              setFormData({ selected_activity_id: e.target.value })
            }
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-slate-400 text-slate-700"
          >
            <option value="">Выберите активность...</option>

            {/* Группируем по категориям */}
            {Array.from(
              new Set(Object.values(ACTIVITIES_MAP).map((a) => a.category)),
            ).map((category) => (
              <optgroup key={category} label={category}>
                {Object.values(ACTIVITIES_MAP)
                  .filter((a) => a.category === category)
                  .map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Ввод времени выполнения */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Длительность (минуты)
          </label>
          <input
            type="number"
            min="0"
            placeholder="Например: 45"
            value={durationMin || ""}
            onChange={(e) => setFormData({ activity_duration: e.target.value })}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-slate-400 text-slate-700"
          />
        </div>

        {/* Динамическая плашка сожженных калорий */}
        {Number(burnedCalories) > 0 && (
          <div className="mt-2 p-3 bg-amber-50 rounded-xl flex items-center gap-2 text-amber-700 text-sm font-semibold border border-amber-100">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            Будет сожжено: +{burnedCalories} ккал (цель на день увеличится)
          </div>
        )}
      </div>

      {/* Кнопка сохранения */}
      <button
        onClick={handleSaveAndBack}
        disabled={isSaving || !selectedActivityId || durationMin <= 0}
        className="w-full p-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Check className="w-5 h-5" />
        {isSaving ? "Сохранение..." : "Добавить в дневник"}
      </button>
    </div>
  );
}
