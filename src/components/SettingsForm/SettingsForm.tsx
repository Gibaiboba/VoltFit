"use client";

import { Save, Loader2, Calendar } from "lucide-react";
import Input from "@/components/shared/input";
import { UserProfile } from "@/types/user";
import { Goal } from "@/types/onboarding";
import { useSettingsForm } from "@/hooks/settings/useSettingsForm";
import { AvatarUpload } from "./AvatarUpload";
import { MetricsDisplay } from "./MetricsDisplay";
import { BodyMeasurements } from "./BodyMeasurements";

export default function SettingsForm({
  initialProfile,
  userId,
}: {
  initialProfile: UserProfile | null;
  userId: string;
}) {
  const {
    formData,
    setFormData,
    updateField,
    calculatedCalories,
    calculatedMacros,
    bmi,
    isUpdating,
    fileInputRef,
    handleUpload,
    handleSaveAll,
    currentAge,
  } = useSettingsForm(initialProfile, userId);

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
        <AvatarUpload
          avatarUrl={formData.avatar_url}
          fileInputRef={fileInputRef}
          onUpload={handleUpload}
        />

        <div className="space-y-6">
          <div className="relative opacity-60 pointer-events-none select-none">
            <Input
              label="Email (нельзя изменить)"
              type="email"
              value={formData.email}
              onChange={() => {}}
            />
          </div>

          <Input
            label="Полное имя"
            type="text"
            value={formData.full_name}
            onChange={updateField("full_name")}
          />

          {/* Персональные метрики покоя */}
          <div className="space-y-2 opacity-80">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Персональные метрики
            </label>
            <div className="h-12 w-full px-4 bg-slate-50 border-2 border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 select-none">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span>
                  Пол: {formData.gender === "male" ? "Мужской" : "Женский"}
                </span>
              </div>
              <span className="bg-slate-200 px-2.5 py-1 rounded-md text-[11px] font-black text-slate-800 uppercase tracking-tight">
                {currentAge > 0
                  ? `${currentAge} лет`
                  : "Дата рождения не указана"}
              </span>
            </div>
          </div>

          {/* Цель тренировок */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Цель тренировок
            </label>
            <select
              value={formData.goal}
              onChange={(e) =>
                setFormData((p) => ({ ...p, goal: e.target.value as Goal }))
              }
              className="w-full h-12 px-4 bg-white border-2 border-slate-200 focus:border-slate-400 outline-none rounded-xl text-xs font-bold text-slate-700 transition-colors uppercase tracking-wider"
            >
              <option value="lose_weight">Похудеть</option>
              <option value="maintain">Поддерживать вес</option>
              <option value="gain_muscle">Набрать массу</option>
            </select>
          </div>

          {/* Уровень активности */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Уровень активности
            </label>
            <select
              value={formData.activity_level}
              onChange={(e) =>
                setFormData((p) => ({ ...p, activity_level: e.target.value }))
              }
              className="w-full h-12 px-4 bg-white border-2 border-slate-200 focus:border-slate-400 outline-none rounded-xl text-xs font-bold text-slate-700 transition-colors uppercase tracking-wider"
            >
              <option value="1.2">
                Минимальная (Сидячая работа, почти нет нагрузок)
              </option>
              <option value="1.375">
                Умеренная (Прогулки или спорт 1-3 раза в неделю)
              </option>
              <option value="1.55">
                Активная (Интенсивный спорт 3-5 раз в неделю)
              </option>
              <option value="1.725">
                Экстремальная (Физический труд или ежедневный спорт)
              </option>
            </select>
          </div>

          {/* Цель воды */}
          <div className="space-y-1">
            <Input
              label="Базовая цель воды покоя (мл)"
              type="number"
              value={formData.water_target}
              onChange={updateField("water_target")}
            />
            <p className="text-[10px] font-medium text-slate-400 px-1 leading-tight">
              *Это норма дня без учета активности. Тренировки и шаги добавят
              воду к этой цифре автоматически на главном экране.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Рост (см)"
              value={formData.height}
              onChange={updateField("height")}
            />
            <Input
              label="Вес (кг)"
              value={formData.weight}
              onChange={updateField("weight")}
              step="0.1"
            />
          </div>

          {/* Расчетные виджеты */}
          <MetricsDisplay
            calories={calculatedCalories}
            macros={calculatedMacros}
            bmi={bmi}
          />

          {/* Обмеры тела */}
          <BodyMeasurements
            chest={formData.chest}
            waist={formData.waist}
            hips={formData.hips}
            onChange={updateField}
          />
        </div>
      </div>

      <button
        onClick={handleSaveAll}
        disabled={isUpdating}
        className="w-full h-14 bg-blue-600 text-white font-black text-sm uppercase tracking-wider rounded-xl border-b-4 border-blue-800 hover:bg-blue-500 active:border-b-0 active:mt-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isUpdating ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Save size={18} />
        )}
        Сохранить изменения
      </button>
    </div>
  );
}
