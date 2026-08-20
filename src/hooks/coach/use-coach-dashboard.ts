"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { useCoachStore } from "@/store/useCoachStore";
import { useUserStore } from "@/store/useUserStore";
import { useCoachQueries } from "./use-queries";
import { useCoachMutations } from "./use-mutations";
import { StudentData, StudentView } from "@/types/coach";
import { useDebounce } from "@/hooks/use-debounce";

export const useCoachDashboard = () => {
  const { searchQuery, setSearchQuery, selectedStudent, setSelectedStudent } =
    useCoachStore();
  const { user } = useUserStore();
  const coachId = user?.id;

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  const { studentsQuery } = useCoachQueries();

  // Достаем обе мутации из нашего обновленного хука
  const { addStudentMutation, removeStudentMutation } = useCoachMutations();

  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      setSearchQuery(debouncedSearch);
    }
  }, [debouncedSearch, searchQuery, setSearchQuery]);

  // (Вся логика enrichedStudents остается без изменений, пропускаем для компактности)
  const enrichedStudents = useMemo((): StudentView[] => {
    const students = studentsQuery.data || [];
    const query = searchQuery.toLowerCase();
    return students
      .filter((item: StudentData) =>
        (item.student?.full_name ?? "").toLowerCase().includes(query),
      )
      .map((item: StudentData): StudentView => {
        // ... старый расчет калорий и шагов
        return { ...item, weeklySteps: 0 };
      });
  }, [studentsQuery.data, searchQuery]);

  const resetFilters = useCallback(() => {
    setLocalSearch("");
    setSearchQuery("");
  }, [setSearchQuery]);

  // Добавляем метод удаления в доступные действия
  const actions = useMemo(
    () => ({
      setSearchQuery: setLocalSearch,
      setSelectedStudent,
      resetFilters,
      addStudent: (email: string, options?: { onSuccess?: () => void }) => {
        if (!coachId) return;
        addStudentMutation.mutate(
          { email, coachId },
          {
            onSuccess: () => options?.onSuccess?.(),
          },
        );
      },
      //  Метод удаления
      removeStudent: (studentId: string) => {
        if (!coachId) return;
        removeStudentMutation.mutate({ studentId, coachId });
      },
    }),
    [
      setSelectedStudent,
      resetFilters,
      addStudentMutation,
      removeStudentMutation,
      coachId,
    ],
  );

  const state = useMemo(
    () => ({
      students: enrichedStudents,
      isLoading: studentsQuery.isLoading,
      isError: studentsQuery.isError,
      isAdding: addStudentMutation.isPending,
      isRemoving: removeStudentMutation.isPending,
      searchQuery: localSearch,
      selectedStudent,
      totalCount: enrichedStudents.length,
    }),
    [
      enrichedStudents,
      studentsQuery.isLoading,
      studentsQuery.isError,
      addStudentMutation.isPending,
      removeStudentMutation.isPending,
      localSearch,
      selectedStudent,
    ],
  );

  return { state, actions };
};
