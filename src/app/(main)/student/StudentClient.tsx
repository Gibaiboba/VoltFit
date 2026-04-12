"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Calendar, Scale, Footprints, Moon } from "lucide-react";
import { UserProfile } from "@/store/useUserStore";
import { Log } from "@/store/useLogStore";
import { MacroCard } from "@/components/student/macro-card";
import LogHistory from "@/components/shared/LogHistory";
import PersonalTip from "@/components/shared/PersonalTip";
import { ProgressBar } from "@/components/student/progress-bar";
import CaloriesBanner from "@/components/student/calories-banner";
import MetricWater from "@/components/student/metric-water";
import MetricInput from "@/components/student/metric-input";
import ActivitySelector from "@/components/student/activity-selector";
import ChartsSection from "@/components/student/chart-section";
import { useStudentDashboard } from "@/hooks/use-student-dashboard";

export default function StudentClient({
  initialHistory,
  initialProfile,
  serverToday,
}: {
  initialHistory: Log[];
  initialProfile: UserProfile | null;
  serverToday: string;
}) {
  const { state, actions } = useStudentDashboard(
    initialHistory,
    initialProfile,
    serverToday,
  );

  const {
    loading,
    todayStr,
    formData,
    selectedDate,
    isToday,
    hasLog,
    chartData,
    currentCalories,
    targetCalories,
    calProgress,
    consumedFromHistory,
    history,
  } = state;

  const { handleDateChange, handleSave, setFormData } = actions;

  // Расчет макросов оставляем здесь (это бизнес-логика данных)
  const macroStats = useMemo(
    () => [
      {
        label: "Белки",
        target: initialProfile?.protein || 0,
        current: Math.round(consumedFromHistory.p),
        colors: {
          color: "bg-orange-500",
          light: "bg-orange-50",
          text: "text-orange-600",
        },
      },
      {
        label: "Жиры",
        target: initialProfile?.fat || 0,
        current: Math.round(consumedFromHistory.f),
        colors: {
          color: "bg-rose-500",
          light: "bg-rose-50",
          text: "text-rose-600",
        },
      },
      {
        label: "Углеводы",
        target: initialProfile?.carbs || 0,
        current: Math.round(consumedFromHistory.c),
        colors: {
          color: "bg-indigo-500",
          light: "bg-indigo-50",
          text: "text-indigo-600",
        },
      },
    ],
    [initialProfile, consumedFromHistory],
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen pt-24 pb-12 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl relative overflow-hidden">
          <ProgressBar hasLog={hasLog} />

          {/* Навигация */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-slate-50 p-2 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-2 px-4 py-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-600 outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={() => !isToday && handleDateChange(todayStr)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${
                isToday
                  ? "bg-white text-blue-500 border border-slate-200"
                  : "bg-orange-500 text-white shadow-lg"
              }`}
            >
              {isToday ? "● Сегодня" : "📅 Вернуться"}
            </button>
          </div>

          {/* Сетка БЖУ */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {macroStats.map((m) => (
              <MacroCard key={m.label} {...m} />
            ))}
          </div>

          <CaloriesBanner
            current={currentCalories}
            target={targetCalories}
            progress={calProgress}
          />
          <Link
            href="/products"
            className="flex items-center mb-4 justify-center p-4 bg-white text-slate-700 font-bold rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            + Добавить еду
          </Link>

          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <MetricWater
                value={formData.water}
                onAdd={() =>
                  setFormData((p) => ({ ...p, water: p.water + 250 }))
                }
              />

              <MetricInput
                title="Вес"
                icon={Scale}
                color="orange"
                value={formData.weight}
                footer={`Пред: ${history[1]?.weight || "--"}`}
                onChange={(v) => setFormData((p) => ({ ...p, weight: v }))}
              />

              <MetricInput
                title="Шаги"
                icon={Footprints}
                color="emerald"
                value={formData.steps}
                footer="Цель: 10 000"
                onChange={(v) => setFormData((p) => ({ ...p, steps: v }))}
              />

              <MetricInput
                title="Сон"
                icon={Moon}
                color="indigo"
                value={formData.sleepHours}
                suffix="ч"
                onChange={(v) => setFormData((p) => ({ ...p, sleepHours: v }))}
              />
            </div>

            <ActivitySelector
              value={formData.activityLevel}
              onChange={(v) => setFormData((p) => ({ ...p, activityLevel: v }))}
            />

            <button
              onClick={handleSave}
              className={`w-full py-6 text-white font-black rounded-[32px] shadow-2xl transition-all uppercase tracking-widest active:scale-95 ${
                hasLog
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {hasLog ? "✨ Обновить отчет" : "🚀 Сохранить отчет"}
            </button>
          </div>
        </div>

        <PersonalTip metadata={initialProfile?.onboarding_metadata} />

        <div className="text-center py-4">
          <Link
            href="/history"
            className="text-xl font-black text-slate-400 hover:text-blue-600 transition-colors"
          >
            Посмотреть всю историю питания →
          </Link>
        </div>

        {history.length >= 2 && <ChartsSection chartData={chartData} />}

        <LogHistory
          logs={history}
          loading={loading}
          title="📊 Последние отчеты"
          onLogClick={handleDateChange}
        />
      </div>
    </div>
  );
}
