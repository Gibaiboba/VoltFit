import { useMemo } from "react";
import { useCoachStore } from "@/store/useCoachStore";
import { useCoachQueries } from "./use-queries";
import { useCoachMutations } from "./use-mutations";
import { StudentData } from "@/types/coach";

export const useCoachDashboard = () => {
  // 1. Состояние из Zustand (фильтры и UI)
  const {
    searchQuery,
    selectedActivity,
    setSearchQuery,
    setSelectedActivity,
    selectedStudent,
    setSelectedStudent,
  } = useCoachStore();

  // 2. Данные из React Query
  const { studentsQuery } = useCoachQueries();
  const { addStudentMutation } = useCoachMutations();

  // 3. Умная фильтрация (useMemo для производительности)
  const filteredStudents = useMemo(() => {
    const students = studentsQuery.data || [];

    return students.filter((item: StudentData) => {
      const lastLog = item.student.daily_logs?.[0];

      // Поиск по имени
      const matchesSearch = (item.student.full_name ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Фильтр по активности
      const matchesActivity =
        selectedActivity === "Все" ||
        lastLog?.activity_level === selectedActivity;

      return matchesSearch && matchesActivity;
    });
  }, [studentsQuery.data, searchQuery, selectedActivity]);

  // 4. Вспомогательная функция для шагов (логика из старого стора)
  const getWeeklySteps = (item: StudentData) => {
    return (
      item.student.daily_logs
        ?.slice(0, 7)
        .reduce((sum, log) => sum + (log.steps || 0), 0) || 0
    );
  };

  // 5. Сброс фильтров
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedActivity("Все");
  };

  return {
    state: {
      students: filteredStudents,
      isLoading: studentsQuery.isLoading,
      isError: studentsQuery.isError,
      isAdding: addStudentMutation.isPending,
      searchQuery,
      selectedActivity,
      selectedStudent,
      totalCount: filteredStudents.length,
    },
    actions: {
      setSearchQuery,
      setSelectedActivity,
      setSelectedStudent,
      resetFilters,
      getWeeklySteps,
      addStudent: addStudentMutation.mutate,
    },
  };
};
