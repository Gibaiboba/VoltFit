"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { useCoachStore } from "@/store/useCoachStore";
import { useUserStore } from "@/store/useUserStore";
import { useCoachQueries } from "./use-queries";
import { useCoachMutations } from "./use-mutations";
import { StudentData, StudentView } from "@/types/coach";
import { useDebounce } from "@/hooks/use-debounce";
import { ACTIVITIES_MAP } from "@/constants/activities";
import { LoggedActivity } from "@/hooks/use-student-dashboard/types";

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

  // Эффект для обновления Zustand с проверкой на равенство
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      setSearchQuery(debouncedSearch);
    }
  }, [debouncedSearch, searchQuery, setSearchQuery]);

  // 4. УМНАЯ ФИЛЬТРАЦИЯ И ДИНАМИЧЕСКИЙ ПЕРЕСЧЕТ С УЧЕТОМ ПОЛА/ВЕСА УЧЕНИКА
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

        // Безопасно собираем категории всех тренировок, выполненных за день
        const logActivities = lastLog?.activities || [];

        const executedCategories = logActivities.map((act: LoggedActivity) => {
          const config = ACTIVITIES_MAP[act.activity_id];
          return config ? config.category : "День без тренировок";
        });

        // Если массив пустой, значит тренировок в этот день не было
        if (executedCategories.length === 0) {
          executedCategories.push("День без тренировок");
        }

        // Сравниваем: фильтр сработает, если выбран "Все", либо если выбранная тренером
        // категория содержится в списке выполненных тренировок ученика за этот день!
        const matchesActivity =
          selectedActivity === "Все" ||
          executedCategories.includes(selectedActivity);

        return matchesSearch && matchesActivity;
      })
      .map((item: StudentData): StudentView => {
        const studentProfile = item.student;

        const studentWeight = Number(studentProfile.weight) || 70;
        const studentGender =
          studentProfile.gender === "male" ? "male" : "female";
        const genderFactor = studentGender === "female" ? 0.014 : 0.015;

        // Динамически пересчитываем burned_calories для всей истории логов ученика
        const updatedLogs = (studentProfile.daily_logs || []).map((log) => {
          const logActivities = log.activities || [];

          // Если ученик взвешивался в конкретный день — берем этот вес, иначе базовый из профиля
          const currentWeight = log.weight > 0 ? log.weight : studentWeight;

          // Считаем сумму калорий за день без промежуточных округлений сессий
          const dayBurnedRaw = logActivities.reduce((sum: number, act) => {
            const config = ACTIVITIES_MAP[act.activity_id];
            if (!config || act.duration <= 0) return sum;
            return (
              sum + config.met * genderFactor * currentWeight * act.duration
            );
          }, 0);

          return {
            ...log,
            // Виртуально подменяем burned_calories на клиенте тренера на точный гендерный расчет
            burned_calories: Math.round(dayBurnedRaw),
          };
        });

        return {
          ...item,
          student: {
            ...item.student,
            daily_logs: updatedLogs, // Заменяем логи на пересчитанные с учетом параметров ученика
          },
          // Считаем шаги только для отфильтрованных и только при изменении данных
          weeklySteps:
            updatedLogs
              ?.slice(0, 7)
              .reduce((sum, log) => sum + (log.steps || 0), 0) || 0,
        };
      });
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
