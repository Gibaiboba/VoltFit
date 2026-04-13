"use client";

import Link from "next/link";
import { Calendar, Scale, Footprints, Moon, Utensils } from "lucide-react";
import { MacroCard } from "@/components/student/macro-card";
import LogHistory from "@/components/shared/LogHistory";
import PersonalTip from "@/components/shared/PersonalTip";
import { ProgressBar } from "@/components/student/progress-bar";
import CaloriesBanner from "@/components/student/calories-banner";
import MetricWater from "@/components/student/metric-water";
import MetricInput from "@/components/student/metric-input";
import ActivitySelector from "@/components/student/activity-selector";
import ChartsSection from "@/components/student/chart-section";
import { DashboardSkeleton } from "@/components/student/dashboard-skeleton";
// Импортируем тип из хука
import { useStudentDashboard } from "@/hooks/use-student-dashboard/index";

interface StudentClientProps {
  userId: string;
  serverToday: string;
}

export default function StudentClient({
  userId,
  serverToday,
}: StudentClientProps) {
  const { state, actions } = useStudentDashboard(userId, serverToday);

  if (state.loading) {
    return <DashboardSkeleton />;
  }

  // Деструктуризация стейта (уже типизировано через StudentDashboardHook)
  const {
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
    profile,
    isSaving,
    todayStr,
  } = state;

  const { handleDateChange, handleSave, setFormData } = actions;

  // Типизированный массив макросов
  const macroStats = [
    {
      label: "Белки",
      target: profile?.protein || 0,
      current: Math.round(consumedFromHistory.p),
      colors: {
        color: "bg-orange-500",
        light: "bg-orange-50",
        text: "text-orange-600",
      },
    },
    {
      label: "Жиры",
      target: profile?.fat || 0,
      current: Math.round(consumedFromHistory.f),
      colors: {
        color: "bg-rose-500",
        light: "bg-rose-50",
        text: "text-rose-600",
      },
    },
    {
      label: "Углеводы",
      target: profile?.carbs || 0,
      current: Math.round(consumedFromHistory.c),
      colors: {
        color: "bg-indigo-500",
        light: "bg-indigo-50",
        text: "text-indigo-600",
      },
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen pt-24 pb-12 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <div
          key={selectedDate}
          className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl relative overflow-hidden"
        >
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

          {/* Макросы */}
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
            href="/history"
            className="flex items-center justify-center p-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all mb-4"
          >
            <Utensils className="w-4 h-4 mr-2" />
            Посмотреть историю за {isToday ? "сегодня" : "этот день"}
          </Link>
          <Link
            href="/products"
            className="flex items-center mb-8 justify-center p-4 bg-white text-slate-700 font-bold rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            + Добавить еду
          </Link>

          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <MetricWater
                value={formData.water}
                onAdd={actions.addWater}
                onRemove={actions.removeWater}
              />
              <MetricInput
                title="Вес"
                icon={Scale}
                color="orange"
                value={formData.weight}
                footer={`Пред: ${state.previousWeight}`}
                onChange={(v) => setFormData({ weight: v })}
              />
              <MetricInput
                title="Шаги"
                icon={Footprints}
                color="emerald"
                value={formData.steps}
                footer="Цель: 10 000"
                onChange={(v) => setFormData({ steps: v })}
              />
              <MetricInput
                title="Сон"
                icon={Moon}
                color="indigo"
                value={formData.sleep_hours}
                suffix="ч"
                onChange={(v) => setFormData({ sleep_hours: v })}
              />
            </div>

            <ActivitySelector
              value={formData.activity_level}
              onChange={(v) => setFormData({ activity_level: v })}
            />

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full py-6 text-white font-black rounded-[32px] shadow-2xl transition-all uppercase tracking-widest active:scale-95 ${
                hasLog
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSaving
                ? "Сохранение..."
                : hasLog
                  ? "✨ Обновить отчет"
                  : "🚀 Сохранить отчет"}
            </button>
          </div>
        </div>

        <PersonalTip metadata={profile?.onboarding_metadata} />

        {history.length >= 2 && <ChartsSection chartData={chartData} />}

        <LogHistory
          logs={history}
          loading={state.loading}
          title="📊 Последние отчеты"
          onLogClick={handleDateChange}
        />
      </div>
    </div>
  );
}
