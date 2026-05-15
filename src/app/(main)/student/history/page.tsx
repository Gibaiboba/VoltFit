"use client";

import { useUserStore } from "@/store/useUserStore";
import { useStudentDashboard } from "@/hooks/use-student-dashboard/index";
import { useRouter } from "next/navigation";
import ChartsSection from "@/components/student/chart-section";
import LogHistory from "@/components/shared/LogHistory";
import AsyncBoundary from "@/components/shared/AsyncBoundary";
import { DashboardSkeleton } from "@/components/student/dashboard-skeleton";
import { toISODate } from "@/lib/utils/date-utils";

export default function HistoryLogPage() {
  const router = useRouter();

  // Достаем объект user из твоего Zustand-стора
  const { user } = useUserStore();

  // Используем твой хелпер для получения безопасной даты в формате "YYYY-MM-DD"
  const todayStr = toISODate(new Date());

  // Передаем id пользователя (если он еще не подгрузился, используем пустую строку)
  const { state, actions } = useStudentDashboard(user?.id || "", todayStr);

  return (
    <AsyncBoundary
      isLoading={state.loading}
      error={state.error}
      onRetry={actions.refetch}
      skeleton={<DashboardSkeleton />}
    >
      <div className="p-6 max-w-4xl mx-auto pt-24 pb-44 space-y-8 animate-in fade-in duration-300 text-slate-900">
        {/* 1. ГРАФИКИ (Отображаем, если есть хотя бы 2 отчета) */}
        {state.chartData && state.history && state.history.length >= 2 && (
          <div className="bg-white p-6 rounded-[40px] border border-slate-200/50 shadow-sm">
            <ChartsSection chartData={state.chartData} />
          </div>
        )}

        {/* 2. КАРТОЧКИ ИСТОРИИ */}
        <div className="bg-white p-6 rounded-[40px] border border-slate-200/50 shadow-sm">
          <LogHistory
            logs={state.history || []} // Безопасный фолбэк на пустой массив
            loading={state.loading}
            title="📊 Последние отчеты"
            onLogClick={(date) => {
              actions.handleDateChange(date);
              router.push("/student"); // Быстрый переход на трекер выбранного дня
            }}
          />
        </div>
      </div>
    </AsyncBoundary>
  );
}
