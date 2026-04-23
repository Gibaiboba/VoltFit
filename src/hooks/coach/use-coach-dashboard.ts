"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { useCoachStore } from "@/store/useCoachStore";
import { useUserStore } from "@/store/useUserStore"; // ИЗМЕНЕНИЕ: Импорт стора пользователя
import { useCoachQueries } from "./use-queries";
import { useCoachMutations } from "./use-mutations";
import { StudentData, StudentView } from "@/types/coach";
import { useDebounce } from "@/hooks/use-debounce";

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

  // ИЗМЕНЕНИЕ: Получаем профиль текущего тренера для ID
  const { profile } = useUserStore();

  // 2. Локальное состояние для мгновенного отображения в инпуте
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  // 3. Данные и мутации из React Query
  const { studentsQuery } = useCoachQueries();
  const { addStudentMutation } = useCoachMutations();

  // Синхронизация: когда дебаунс сработал — обновляем глобальный стор
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  // Синхронизация: если searchQuery изменился извне (например, сброс фильтров)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // 4. Умная фильтрация + Расчет шагов (один проход по массиву)
  const enrichedStudents = useMemo((): StudentView[] => {
    const students = studentsQuery.data || [];
    const query = searchQuery.toLowerCase();

    return students
      .filter((item: StudentData) => {
        // ИЗМЕНЕНИЕ: Безопасный доступ к логам (решает ошибку Spread types / Object types)
        const studentProfile = item.student;
        const lastLog = studentProfile?.daily_logs?.[0];

        const matchesSearch = (studentProfile?.full_name ?? "")
          .toLowerCase()
          .includes(query);

        const matchesActivity =
          selectedActivity === "Все" ||
          lastLog?.activity_level === selectedActivity;

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
  const resetFilters = useCallback(() => {
    setLocalSearch("");
    setSearchQuery("");
    setSelectedActivity("Все");
  }, [setSearchQuery, setSelectedActivity]);

  const actions = useMemo(
    () => ({
      setSearchQuery: setLocalSearch,
      setSelectedActivity,
      setSelectedStudent,
      resetFilters,
      // ИЗМЕНЕНИЕ: Адаптер для добавления студента
      // Теперь принимает только email (string) и простые опции
      addStudent: (email: string, options?: { onSuccess?: () => void }) => {
        if (!profile?.id) return;

        addStudentMutation.mutate(
          { email, coachId: profile.id },
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
      profile?.id,
    ],
  );

  // 6. Стабильное состояние (state)
  const state = useMemo(
    () => ({
      students: enrichedStudents,
      isLoading: studentsQuery.isLoading,
      isError: studentsQuery.isError,
      isAdding: addStudentMutation.isPending,
      searchQuery: localSearch,
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
