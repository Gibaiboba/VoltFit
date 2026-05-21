"use client";

import { useUserStore } from "@/store/useUserStore";
import { useStudentDashboard } from "@/hooks/use-student-dashboard/index";
import { useRouter } from "next/navigation";
import ChartsSection from "@/components/student/chart-section";
import LogHistory from "@/components/shared/LogHistory";
import AsyncBoundary from "@/components/shared/AsyncBoundary";
import { DashboardSkeleton } from "@/components/student/dashboard-skeleton";
import { toISODate } from "@/lib/utils/date-utils";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

export default function HistoryLogPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const todayStr = toISODate(new Date());

  // Вызываем хук дашборда, который теперь работает на бесконечных запросах
  const { state, actions } = useStudentDashboard(user?.id || "", todayStr);

  //  Подключаем автоскролл через Intersection Observer
  const loadMoreRef = useIntersectionObserver({
    // При появлении маяка на экране вызываем метод загрузки следующей страницы
    onIntersect: () => state.logsQuery.fetchNextPage(),
    // Ищем маяк только если есть что загружать дальше и сейчас нет активного запроса
    enabled: state.logsQuery.hasNextPage && !state.logsQuery.isFetchingNextPage,
  });

  return (
    <AsyncBoundary
      isLoading={state.loading}
      error={state.error}
      onRetry={actions.refetch}
      skeleton={<DashboardSkeleton />}
    >
      <div className="p-6 max-w-4xl mx-auto pt-24 pb-44 space-y-8 animate-in fade-in duration-300 text-slate-900">
        {/* 1. ГРАФИКИ (Берут последние 10 дней из подгруженного массива и не ломают верстку) */}
        {state.chartData && state.history && state.history.length >= 2 && (
          <div className="bg-white p-6 rounded-[40px] border border-slate-200/50 shadow-sm">
            <ChartsSection chartData={state.chartData} />
          </div>
        )}

        {/* 2. КАРТОЧКИ ИСТОРИИ */}
        <div className="bg-white p-6 rounded-[40px] border border-slate-200/50 shadow-sm space-y-6">
          <LogHistory
            logs={state.history || []}
            loading={state.loading}
            title="📊 История отчетов"
            onLogClick={(date) => {
              actions.handleDateChange(date);
              router.push("/student");
            }}
          />

          {/* ИСПРАВЛЕНО: Элемент-маяк для автоскролла и индикатор загрузки */}
          <div
            ref={loadMoreRef}
            className="w-full pt-4 flex justify-center text-xs font-black uppercase text-slate-400 tracking-wider"
          >
            {state.logsQuery.isFetchingNextPage && (
              <div className="flex items-center gap-2 animate-pulse">
                <span>⌛ Загрузка старых отчетов...</span>
              </div>
            )}
            {!state.logsQuery.hasNextPage && state.history.length > 0 && (
              <span className="text-slate-300 italic lowercase text-[10px]">
                — это все доступные отчеты —
              </span>
            )}
          </div>
        </div>
      </div>
    </AsyncBoundary>
  );
}
