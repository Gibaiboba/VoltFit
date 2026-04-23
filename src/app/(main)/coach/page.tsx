"use client";

import { useCallback } from "react";
import { useCoachDashboard } from "@/hooks/coach/use-coach-dashboard";
import AddStudentForm from "@/components/coach/AddStudentForm";
import StudentCard from "@/components/coach/StudentCard";
import StudentModal from "@/components/coach/StudentModal";
import Link from "next/link";
import { StudentView } from "@/types/coach";
import { X } from "lucide-react";

const ACTIVITY_FILTERS = [
  "Все",
  "Силовая тренировка",
  "Кардио тренировка",
  "Групповая тренировка",
  "День без тренировок",
];

const getStudentLabel = (count: number) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return "учеников";
  if (lastDigit === 1) return "ученик";
  if (lastDigit >= 2 && lastDigit <= 4) return "ученика";
  return "учеников";
};

export default function CoachDashboard() {
  const { state, actions } = useCoachDashboard();

  // ТИПИЗАЦИЯ: Используем StudentView
  const handleStudentClick = useCallback(
    (student: StudentView) => {
      actions.setSelectedStudent(student);
    },
    [actions],
  );

  // Стабильные обработчики для фильтров
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      actions.setSearchQuery(e.target.value);
    },
    [actions],
  );

  const handleActivityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      actions.setSelectedActivity(e.target.value);
    },
    [actions],
  );

  return (
    <div className="p-6 bg-slate-50 pt-24 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Панель <span className="text-blue-600">Тренера</span>
          </h1>

          <Link
            href="/diary"
            className="text-xl font-bold text-blue-600 hover:underline inline-flex items-center gap-2"
          >
            📊 История питания тренера
          </Link>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Поиск ученика по имени..."
                value={state.searchQuery}
                onChange={handleSearchChange}
                className="w-full p-4 pl-12 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 shadow-sm font-semibold text-slate-700"
              />

              {/* Кнопка очистки */}
              {state.searchQuery && (
                <button
                  onClick={() => actions.setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Очистить поиск"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <select
              value={state.selectedActivity}
              onChange={handleActivityChange}
              className="p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 shadow-sm font-bold text-slate-600 cursor-pointer px-8 appearance-none"
            >
              {ACTIVITY_FILTERS.map((filter) => (
                <option key={filter} value={filter}>
                  {filter === "Все" ? "🎯 Все активности" : filter}
                </option>
              ))}
            </select>
          </div>
        </div>

        {state.isError && (
          <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[32px] text-center">
            <p className="text-red-600 font-bold">Ошибка при загрузке данных</p>
          </div>
        )}

        {!state.isLoading && !state.isError && (
          <div className="flex items-center justify-between px-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              {state.totalCount > 0 ? (
                <>
                  Найдено:{" "}
                  <span className="text-blue-600">{state.totalCount}</span>{" "}
                  {getStudentLabel(state.totalCount)}
                </>
              ) : (
                "Результатов нет"
              )}
            </p>
            {(state.searchQuery || state.selectedActivity !== "Все") && (
              <button
                onClick={actions.resetFilters}
                className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500"
              >
                ✕ Сбросить фильтры
              </button>
            )}
          </div>
        )}

        <AddStudentForm
          isPending={state.isAdding}
          onAdd={
            (
              email,
              opts, // ИЗМЕНЕНИЕ: принимаем строку email
            ) => actions.addStudent(email, opts) // ИЗМЕНЕНИЕ: просто прокидываем в экшен
          }
        />

        {state.isLoading ? (
          <div className="flex justify-center p-12 animate-pulse text-slate-400 font-black uppercase tracking-widest text-xs">
            Загрузка данных...
          </div>
        ) : (
          <div className="grid gap-6">
            {state.totalCount === 0 && !state.isError ? (
              <div className="bg-white p-16 rounded-[40px] border-2 border-dashed border-slate-200 text-center text-slate-400">
                Никто не подходит под эти параметры
              </div>
            ) : (
              state.students.map((item) => (
                <StudentCard
                  key={item.student.id}
                  item={item}
                  weeklySteps={item.weeklySteps}
                  onClick={handleStudentClick}
                />
              ))
            )}
          </div>
        )}
      </div>

      {state.selectedStudent && <StudentModal />}
    </div>
  );
}
