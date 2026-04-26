"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import {
  Scale,
  Footprints,
  Moon,
  Utensils,
  CalendarCheck,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { MacroCard } from "@/components/student/macro-card";
import LogHistory from "@/components/shared/LogHistory";
import PersonalTip from "@/components/shared/PersonalTip";
import CaloriesBanner from "@/components/student/calories-banner";
import MetricWater from "@/components/student/metric-water";
import MetricInput from "@/components/student/metric-input";
import ActivitySelector from "@/components/student/activity-selector";
import ChartsSection from "@/components/student/chart-section";
import { SaveButton } from "@/components/student/save-button";
import { DateNavigation } from "@/components/student/date-navigation";
import { DashboardSkeleton } from "@/components/student/dashboard-skeleton";
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
  const [activeTab, setActiveTab] = useState<"daily" | "history">("daily");

  const {
    loading,
    error,
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
    previousWeight,
  } = state;

  const { handleDateChange, handleSave, setFormData, addWater, removeWater } =
    actions;

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const macroStats = useMemo(
    () => [
      {
        label: "Белки",
        target: profile?.protein || 0,
        current: Math.round(consumedFromHistory.p),
        colors: {
          stroke: "#ffbb54",
          bg: "bg-[#FFD700]/10",
          accent: "text-[#E6B800]",
        },
      },
      {
        label: "Жиры",
        target: profile?.fat || 0,
        current: Math.round(consumedFromHistory.f),
        colors: {
          stroke: "#3ca593",
          bg: "bg-[#4C9A2A]/10",
          accent: "text-[#2D5A1E]",
        },
      },
      {
        label: "Углеводы",
        target: profile?.carbs || 0,
        current: Math.round(consumedFromHistory.c),
        colors: { stroke: "#F8FAFC", bg: "bg-white/10", accent: "text-white" },
      },
    ],
    [profile, consumedFromHistory],
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-6 bg-[#F4F4F5] min-h-screen pt-24 pb-44 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {activeTab === "daily" ? (
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
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {history.length >= 2 && (
              <div className="bg-white p-6 rounded-[40px] border border-slate-200/50 shadow-sm">
                <ChartsSection chartData={chartData} />
              </div>
            )}
            <div className="bg-white p-6 rounded-[40px] border border-slate-200/50 shadow-sm">
              <LogHistory
                logs={history}
                title="📊 Последние отчеты"
                onLogClick={(date) => {
                  handleDateChange(date);
                  setActiveTab("daily");
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ НАВИГАЦИИ */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Подложка для читаемости */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F4F4F5] via-[#F4F4F5]/90 to-transparent h-full pointer-events-none" />

        <div className="max-w-md mx-auto flex items-end justify-around h-28 px-6 pb-8 relative z-10">
          {/* ТРЕКЕР */}
          <button
            onClick={() => setActiveTab("daily")}
            className="flex flex-col items-center gap-1.5 transition-all group"
          >
            <div
              className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all duration-300 ${
                activeTab === "daily"
                  ? "bg-slate-950 text-yellow-400 shadow-xl scale-110"
                  : "bg-white text-slate-500 shadow-sm border border-slate-200"
              }`}
            >
              <CalendarCheck className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                activeTab === "daily" ? "text-slate-950" : "text-slate-400"
              }`}
            >
              Трекер
            </span>
          </button>

          {/* ДОБАВИТЬ ЕДУ */}
          <Link
            href="/diary"
            className="flex flex-col items-center gap-1.5 transition-all group"
          >
            <div className="w-14 h-14 bg-slate-950 rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover:scale-110 active:scale-95 transition-all border border-white/5">
              <Utensils className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">
              Еда
            </span>
          </Link>

          {/* ИСТОРИЯ */}
          <button
            onClick={() => setActiveTab("history")}
            className="flex flex-col items-center gap-1.5 transition-all group"
          >
            <div
              className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all duration-300 ${
                activeTab === "history"
                  ? "bg-slate-950 text-yellow-400 shadow-xl scale-110"
                  : "bg-white text-slate-500 shadow-sm border border-slate-200"
              }`}
            >
              <Clock className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                activeTab === "history" ? "text-slate-950" : "text-slate-400"
              }`}
            >
              История
            </span>
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
