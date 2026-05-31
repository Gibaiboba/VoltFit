"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { useCoachStore } from "@/store/useCoachStore";
import { useUserStore } from "@/store/useUserStore";
import { useCoachQueries } from "./use-queries";
import { useCoachMutations } from "./use-mutations";
import { StudentData, StudentView } from "@/types/coach";
import { useDebounce } from "@/hooks/use-debounce";
import { ACTIVITIES_MAP } from "@/constants/activities";

export const useCoachDashboard = () => {
  // 1. Глобальное состояние из Zustand
  const {
    searchQuery,
    selectedActivity,
    setSearchQuery,
    setSelectedActivity,
    selectedStudent,
    setSelectedStudent,
  } = useCoachStore();

  // Получаем профиль текущего тренера для ID
  const { user } = useUserStore();
  const coachId = user?.id;

  // 2. Local state для мгновенного отображения в инпуте поиска
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  // 3. Данные и мутации из React Query
  const { studentsQuery } = useCoachQueries();
  const { addStudentMutation } = useCoachMutations();

  // эффект для обновления Zustand с проверкой на равенство.
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      setSearchQuery(debouncedSearch);
    }
  }, [debouncedSearch, searchQuery, setSearchQuery]);

  // 4. Умная фильтрация по категориям тренировок из ACTIVITIES_MAP
  const enrichedStudents = useMemo((): StudentView[] => {
    const students = studentsQuery.data || [];
    const query = searchQuery.toLowerCase();

    return students
      .filter((item: StudentData) => {
        const studentProfile = item.student;
        // Достаем самый свежий лог студента
        const lastLog = studentProfile?.daily_logs?.[0];

        const matchesSearch = (studentProfile?.full_name ?? "")
          .toLowerCase()
          .includes(query);

        // Читаем новый selected_activity_id и определяем его текстовую категорию
        const activityId = lastLog?.selected_activity_id || "";
        const currentLogCategory =
          activityId && ACTIVITIES_MAP[activityId]
            ? ACTIVITIES_MAP[activityId].category
            : "День без тренировок";

        // Сравниваем категорию лога с выбранным фильтром ("Все", "Тренажерный зал" и т.д.)
        const matchesActivity =
          selectedActivity === "Все" || currentLogCategory === selectedActivity;

        return matchesSearch && matchesActivity;
      })
      .map(
        (item: StudentData): StudentView => ({
          ...item,
          // Считаем шаги только для отфильтрованных и только при изменении данных
          weeklySteps:
            item.student.daily_logs
              ?.slice(0, 7)
              .reduce((sum, log) => sum + (log.steps || 0), 0) || 0,
        }),
      );
  }, [studentsQuery.data, searchQuery, selectedActivity]);

  // 5. Стабильные действия (actions)
  // 🔥 ИСПРАВЛЕНО: Теперь принудительно очищаем локальный инпут руками,
  // так как реактивного эффекта обратной синхронизации больше нет.
  const resetFilters = useCallback(() => {
    setLocalSearch("");
    setSearchQuery("");
    setSelectedActivity("Все");
  }, [setSearchQuery, setSelectedActivity]);

  const actions = useMemo(
    () => ({
      // При вводе символов мы мгновенно обновляем только локальный быстрый стейт,
      // а дебаунс-эффект выше сам через 300мс обновит глобальный стор без лагов.
      setSearchQuery: setLocalSearch,
      setSelectedActivity,
      setSelectedStudent,
      resetFilters,
      addStudent: (email: string, options?: { onSuccess?: () => void }) => {
        if (!coachId) return;

        addStudentMutation.mutate(
          { email, coachId: coachId },
          {
            onSuccess: () => {
              options?.onSuccess?.();
            },
          },
        );
      },
    }),
    [
      setSelectedActivity,
      setSelectedStudent,
      resetFilters,
      addStudentMutation,
      coachId,
    ],
  );

  // 6. Стабильное состояние (state)
  const state = useMemo(
    () => ({
      students: enrichedStudents,
      isLoading: studentsQuery.isLoading,
      isError: studentsQuery.isError,
      isAdding: addStudentMutation.isPending,
      searchQuery: localSearch, // Экспортируем локальную строку, чтобы инпут обновлялся синхронно
      selectedActivity,
      selectedStudent,
      totalCount: enrichedStudents.length,
    }),
    [
      enrichedStudents,
      studentsQuery.isLoading,
      studentsQuery.isError,
      addStudentMutation.isPending,
      localSearch,
      selectedActivity,
      selectedStudent,
    ],
  );

  return { state, actions };
};
