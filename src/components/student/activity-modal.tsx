"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2, Flame, Check } from "lucide-react";
import { ACTIVITIES_MAP } from "@/constants/activities";
import {
  FormUpdater,
  FormDataType,
  LoggedActivity,
} from "@/hooks/use-student-dashboard/types";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import CaloriesBanner from "@/components/student/calories-banner";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormDataType;
  setFormData: (updater: FormUpdater) => void;
  burnedCalories: number; // Оставляем в пропсах для обратной совместимости с родителем
  currentCalories: number;
  targetCalories: number;
  calProgress: number;
  onSave: () => void;
  isSaving: boolean;
}

export function ActivityModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  currentCalories,
  targetCalories,
  calProgress,
  onSave,
  isSaving,
}: ActivityModalProps) {
  const onboardingData = useOnboardingStore((state) => state.data);
  const userWeight = Number(onboardingData?.weight) || 70;
  const userGender = onboardingData?.gender || "female";

  // Локальные стейты для конструирования ОДНОЙ текущей добавляемой сессии
  const [localActivityId, setLocalActivityId] = useState("");
  const [localDuration, setLocalDuration] = useState("");

  // ПОДСЧЕТ СУММЫ НА ЛЕТУ ИЗ ТЕКУЩЕГО МАССИВА СЕССИЙ
  const totalBurnedCalories = (formData.activities || []).reduce(
    (sum, act) => sum + (Number(act.burned_calories) || 0),
    0,
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = Array.from(
    new Set(Object.values(ACTIVITIES_MAP).map((a) => a.category)),
  );

  //  Добавление новой сессии в массив активностей дня
  const handleAddSession = () => {
    if (!localActivityId || Number(localDuration) <= 0) return;

    const config = ACTIVITIES_MAP[localActivityId];
    if (!config) return;

    // Считаем калории конкретно этой добавляемой сессии
    const genderFactor = userGender === "female" ? 0.014 : 0.015;
    const sessionBurned = Math.round(
      config.met * genderFactor * userWeight * Number(localDuration),
    );

    const newSession: LoggedActivity = {
      id: crypto.randomUUID(),
      activity_id: localActivityId,
      duration: Number(localDuration),
      burned_calories: sessionBurned,
    };

    // Пушим в массив formData через иммутабельный апдейтер
    setFormData((prev) => ({
      ...prev,
      activities: [...(prev.activities || []), newSession],
    }));

    // Очищаем инпуты конструктора сессии
    setLocalActivityId("");
    setLocalDuration("");
  };

  // Удаление конкретной сессии из массива
  const handleRemoveSession = (sessionId: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: (prev.activities || []).filter((act) => act.id !== sessionId),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#F4F4F5] rounded-3xl p-6 shadow-2xl space-y-5 relative flex flex-col max-h-[90vh] text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <div>
          <h2 className="text-lg font-bold text-slate-800">Активность дня</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Параметры расчета:{" "}
            <span className="font-semibold">{userWeight} кг</span>,{" "}
            {userGender === "female" ? "женский" : "мужской"} пол.
          </p>
        </div>

        <CaloriesBanner
          current={currentCalories}
          target={targetCalories}
          progress={calProgress}
        />

        {/* БЛОК 1. КОНСТРУКТОР СЕССИИ (ДОБАВЛЕНИЕ) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Новая тренировка
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={localActivityId}
              onChange={(e) => setLocalActivityId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-400 text-slate-700"
            >
              <option value="">Выберите тип...</option>
              {categories.map((category) => (
                <optgroup key={category} label={category}>
                  {Object.values(ACTIVITIES_MAP)
                    .filter((a) => a.category === category)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name.split(" ").slice(1).join(" ")}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                placeholder="Мин"
                value={localDuration}
                onChange={(e) => setLocalDuration(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-400 text-slate-700"
              />
              <button
                type="button"
                onClick={handleAddSession}
                disabled={!localActivityId || Number(localDuration) <= 0}
                className="p-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all flex items-center justify-center shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* БЛОК 2. СПИСОК УЖЕ ДОБАВЛЕННЫХ ТРЕНИРОВОК ЗА СЕГОДНЯ */}
        <div className="flex-1 overflow-y-auto space-y-2 max-h-[200px] pr-1">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            Запланировано на сегодня
          </h3>

          {!formData.activities || formData.activities.length === 0 ? (
            <p className="text-xs italic text-slate-400 text-center py-4 bg-white rounded-2xl border border-dashed border-slate-200">
              Тренировок пока не добавлено
            </p>
          ) : (
            formData.activities.map((act) => {
              const config = ACTIVITIES_MAP[act.activity_id];
              return (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm animate-in fade-in duration-150"
                >
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-700">
                      {config?.name || "Тренировка"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Длительность: {act.duration} мин |{" "}
                      <span className="text-amber-600 font-semibold">
                        +{act.burned_calories} ккал
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveSession(act.id)}
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* ИТОГОВАЯ СУММА — ИСПОЛЬЗУЕТ ДИНАМИЧЕСКИЙ СЧЕТЧИК */}
        {totalBurnedCalories > 0 && (
          <div className="p-3 bg-amber-50 rounded-xl flex items-center gap-2 text-amber-700 text-xs font-semibold border border-amber-100">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            Всего будет сожжено за сегодня: +{totalBurnedCalories} ккал
          </div>
        )}

        {/* КНОПКИ ДЕЙСТВИЙ */}
        <div className="flex gap-3 pt-2 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 p-3.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl transition-all text-xs"
          >
            Отмена
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 p-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
          >
            <Check className="w-4 h-4" />
            {isSaving ? "Сохранение..." : "Сохранить в дневник"}
          </button>
        </div>
      </div>
    </div>
  );
}
