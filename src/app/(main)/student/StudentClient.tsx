"use client";

import { UserProfile } from "@/store/useUserStore";
import { Log } from "@/store/useLogStore";
import {
  ChevronDown,
  Calendar,
  Droplets,
  Scale,
  Footprints,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { MacroCard } from "@/components/student/macro-card";
import { ProgressCircle } from "@/components/student/progress-circle";
import { MetricCard } from "@/components/student/metric-card";
import LogHistory from "@/components/shared/LogHistory";
import ActivityVisualizer from "@/components/shared/ActivityVisualizer";
import PersonalTip from "@/components/shared/PersonalTip";
import { ACTIVITY_OPTIONS } from "@/constants/activityOptions";
import { useStudentDashboard } from "@/hooks/use-student-dashboard";

export default function StudentClient({
  initialHistory,
  initialProfile,
}: {
  initialHistory: Log[];
  initialProfile: UserProfile | null;
}) {
  const { state, actions } = useStudentDashboard(
    initialHistory,
    initialProfile,
  );
  const {
    profile,
    loading,
    todayStr,
    formData,
    selectedDate,
    isToday,
    hasLog,
    chartData,
    activeProfile,
    currentCalories,
    targetCalories,
    calProgress,
    consumedFromHistory,
    history,
  } = state;

  const { handleDateChange, handleSave, setFormData } = actions;

  const macros = [
    {
      label: "Белки",
      target: activeProfile?.protein || 0,
      current: Math.round(consumedFromHistory.p),
      colors: {
        color: "bg-orange-500",
        light: "bg-orange-50",
        text: "text-orange-600",
      },
    },
    {
      label: "Жиры",
      target: activeProfile?.fat || 0,
      current: Math.round(consumedFromHistory.f),
      colors: {
        color: "bg-rose-500",
        light: "bg-rose-50",
        text: "text-rose-600",
      },
    },
    {
      label: "Углеводы",
      target: activeProfile?.carbs || 0,
      current: Math.round(consumedFromHistory.c),
      colors: {
        color: "bg-indigo-500",
        light: "bg-indigo-50",
        text: "text-indigo-600",
      },
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl relative overflow-hidden">
          {/* Индикатор загрузки дня */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50">
            <div
              className={`h-full transition-all duration-500 ${hasLog ? "bg-indigo-500 w-full" : "bg-blue-500 w-1/2"}`}
            />
          </div>

          {/* Хедер: Календарь */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-slate-50 p-2 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-2 px-4 py-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-600 outline-none"
              />
            </div>
            <button
              onClick={() => !isToday && handleDateChange(todayStr)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${isToday ? "bg-white text-blue-500 border border-slate-200" : "bg-orange-500 text-white"}`}
            >
              {isToday ? "● Сегодня" : "📅 Вернуться в сегодня"}
            </button>
          </div>

          {/* Блок БЖУ */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {macros.map((m) => (
              <MacroCard key={m.label} {...m} />
            ))}
          </div>

          {/* Главный дашборд калорий */}
          <div className="bg-slate-900 rounded-[45px] p-8 text-white shadow-2xl relative overflow-hidden mb-8">
            <div className="flex justify-between items-center relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
                  Сегодня съедено
                </span>
                <div className="text-5xl font-black italic">
                  {Math.round(currentCalories)}
                  <span className="text-xl opacity-30 ml-2">
                    / {targetCalories}
                  </span>
                </div>
                <div className="text-lg font-black italic text-emerald-400">
                  Осталось:{" "}
                  {Math.max(0, targetCalories - Math.round(currentCalories))}{" "}
                  ккал
                </div>
              </div>
              <ProgressCircle progress={calProgress} />
            </div>
          </div>

          {/* ВЫПАДАЮЩИЙ СПИСОК (Activity Options) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              Уровень активности
            </label>
            <div className="relative group">
              <select
                value={formData.activityLevel}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, activityLevel: e.target.value }))
                }
                className="w-full p-4 bg-slate-50 border-2 border-transparent group-hover:bg-slate-100 focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold transition-all appearance-none cursor-pointer pr-10 text-slate-700"
              >
                {ACTIVITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-5 h-5" />
            </div>
          </div>

          {/* Сетка метрик */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <MetricCard
                title="Вода"
                icon={Droplets}
                colorClass={{
                  bg: "bg-blue-50/50",
                  border: "border-blue-100",
                  iconBg: "bg-blue-500",
                  text: "text-blue-400",
                }}
              >
                <div className="text-2xl font-black italic text-blue-600">
                  {formData.water} мл
                </div>
                <button
                  onClick={() =>
                    setFormData((p) => ({ ...p, water: p.water + 250 }))
                  }
                  className="w-full py-2.5 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase border border-blue-100"
                >
                  + 250 мл
                </button>
              </MetricCard>

              <MetricCard
                title="Вес"
                icon={Scale}
                footer={`Последний: ${history[0]?.weight || "--"}`}
                colorClass={{
                  bg: "bg-orange-50/50",
                  border: "border-orange-100",
                  iconBg: "bg-orange-500",
                  text: "text-orange-400",
                  footerText: "text-orange-300",
                }}
              >
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, weight: e.target.value }))
                  }
                  className="w-20 text-2xl font-black italic bg-transparent text-orange-600 text-center outline-none"
                />
              </MetricCard>

              <MetricCard
                title="Шаги"
                icon={Footprints}
                footer="Цель: 10 000"
                colorClass={{
                  bg: "bg-emerald-50/50",
                  border: "border-emerald-100",
                  iconBg: "bg-emerald-500",
                  text: "text-emerald-400",
                  footerText: "text-emerald-300",
                }}
              >
                <input
                  type="number"
                  value={formData.steps}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, steps: e.target.value }))
                  }
                  className="w-full text-2xl font-black italic bg-transparent text-emerald-600 text-center outline-none"
                />
              </MetricCard>

              <MetricCard
                title="Сон"
                icon={Moon}
                footer="Качество: норм"
                colorClass={{
                  bg: "bg-indigo-50/50",
                  border: "border-indigo-100",
                  iconBg: "bg-indigo-500",
                  text: "text-indigo-400",
                  footerText: "text-indigo-300",
                }}
              >
                <input
                  type="number"
                  step="0.5"
                  value={formData.sleepHours}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, sleepHours: e.target.value }))
                  }
                  className="w-16 text-2xl font-black italic bg-transparent text-indigo-600 text-center outline-none"
                />
              </MetricCard>
            </div>

            <button
              onClick={handleSave}
              className={`w-full py-5 text-white font-black rounded-2xl shadow-xl transition-all uppercase ${hasLog ? "bg-indigo-600" : "bg-blue-600"}`}
            >
              {hasLog ? "✨ Обновить отчет" : "🚀 Сохранить отчет"}
            </button>
          </div>
        </div>

        <div className="flex mt-10 mb-10 w-full items-center justify-center">
          <Link
            href="/history"
            className="text-4xl font-bold text-blue-600 hover:underline"
          >
            История питания
          </Link>
        </div>

        {/* Дополнительные секции */}
        <PersonalTip metadata={profile?.onboarding_metadata} />
        {history.length >= 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActivityVisualizer
              title="👟 Активность"
              unit="шагов"
              data={chartData.steps}
              color="blue"
            />
            <ActivityVisualizer
              title="🔥 Калории"
              unit="ккал"
              data={chartData.calories}
              color="rose"
            />
          </div>
        )}
        <LogHistory
          logs={history}
          loading={loading}
          title="📊 История"
          onLogClick={handleDateChange}
        />
      </div>
    </div>
  );
}
