"use client";

import { useMemo } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
import ChartsSection from "@/components/student/chart-section";
import LogHistory from "@/components/shared/LogHistory";
import AsyncBoundary from "@/components/shared/AsyncBoundary";
import { DashboardSkeleton } from "@/components/student/dashboard-skeleton";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { DailyLog } from "@/types/shared";
import { getErrorMessage } from "@/lib/utils/error-helper";

export default function HistoryLogPage() {
  const router = useRouter();
  const { user, setSelectedDate } = useUserStore();
  const userId = user?.id || "";

  // 1. Изолированный бесконечный запрос логов порциями по 20 штук
  const logsQuery = useInfiniteQuery<DailyLog[], Error>({
    queryKey: ["student-logs-infinite", userId],
    queryFn: ({ pageParam }) =>
      studentService.getLogsPaged(userId, pageParam as string, 20),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      // Дата последнего элемента в пачке становится курсором для следующего запроса
      return lastPage[lastPage.length - 1].log_date;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 минут стабильности данных в памяти устройства
  });

  // 2. Объединяем страницы пагинации в один плоский массив логов
  const history = useMemo(
    () => logsQuery.data?.pages.flat() || [],
    [logsQuery.data],
  );

  // 3. Подготовка данных для графиков (берём строго последние 10 записей из подгруженных)
  const chartData = useMemo(() => {
    if (history.length < 2) return null;

    // Сортируем по дате от старых к новым и берем последние 10 точек для быстродействия рендера
    const sorted = [...history]
      .sort((a, b) => a.log_date.localeCompare(b.log_date))
      .slice(-10);

    return {
      steps: sorted.map((l) => ({ x: l.log_date, y: l.steps || 0 })),
      calories: sorted.map((l) => ({ x: l.log_date, y: l.calories || 0 })),
    };
  }, [history]);

  // 4. Подключаем автозагрузку при скролле через ваш Intersection Observer
  const loadMoreRef = useIntersectionObserver({
    onIntersect: () => logsQuery.fetchNextPage(),
    enabled: logsQuery.hasNextPage && !logsQuery.isFetchingNextPage,
  });

  return (
    <AsyncBoundary
      isLoading={logsQuery.isLoading}
      // Пропускаем объект ошибки через универсальный обработчик
      error={logsQuery.error ? getErrorMessage(logsQuery.error) : null}
      onRetry={() => logsQuery.refetch()}
      skeleton={<DashboardSkeleton />}
    >
      <div className="p-6 max-w-4xl mx-auto pt-24 pb-44 space-y-8 animate-in fade-in duration-300 text-slate-900">
        {/* 1. СЕКЦИЯ ГРАФИКОВ */}
        {chartData && (
          <div className="bg-white p-6 rounded-[40px] border border-slate-200/50 shadow-sm">
            <ChartsSection chartData={chartData} />
          </div>
        )}

        {/* 2. СПИСОК КАРТОЧЕК ИСТОРИИ */}
        <div className="bg-white p-6 rounded-[40px] border border-slate-200/50 shadow-sm space-y-6">
          <LogHistory
            logs={history}
            loading={logsQuery.isLoading}
            title="📊 История отчетов"
            onLogClick={(date) => {
              setSelectedDate(date); // Мгновенно меняем глобальную дату в Zustand
              router.push("/student"); // Перенаправляем на главный дашборд студента
            }}
          />

          {/* Маяк-триггер для бесконечного скролла */}
          <div
            ref={loadMoreRef}
            className="w-full pt-4 flex justify-center text-xs font-black uppercase text-slate-400 tracking-wider"
          >
            {logsQuery.isFetchingNextPage && (
              <div className="flex items-center gap-2 animate-pulse">
                <span>⌛ Загрузка старых отчетов...</span>
              </div>
            )}
            {!logsQuery.hasNextPage && history.length > 0 && (
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
