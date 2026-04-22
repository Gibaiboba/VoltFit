"use client";

import { useCoachDashboard } from "@/hooks/coach/use-coach-dashboard";
import AddStudentForm from "@/components/coach/AddStudentForm";
import StudentCard from "@/components/coach/StudentCard";
import StudentModal from "@/components/coach/StudentModal";
import Link from "next/link";

const ACTIVITY_FILTERS = [
  "Все",
  "Силовая тренировка",
  "Кардио тренировка",
  "Групповая тренировка",
  "День без тренировок",
];

export default function CoachDashboard() {
  const { state, actions } = useCoachDashboard();

  // Функция для склонения (оставлена здесь для чистоты компонента)
  const getStudentLabel = (count: number) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return "учеников";
    if (lastDigit === 1) return "ученик";
    if (lastDigit >= 2 && lastDigit <= 4) return "ученика";
    return "учеников";
  };

  return (
    <div className="p-6 bg-slate-50 pt-24 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Шапка и Фильтры */}
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
                onChange={(e) => actions.setSearchQuery(e.target.value)}
                className="w-full p-4 pl-12 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 shadow-sm transition-all font-semibold text-slate-700 placeholder:font-normal"
              />
              {state.searchQuery && (
                <button
                  onClick={() => actions.setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={state.selectedActivity}
              onChange={(e) => actions.setSelectedActivity(e.target.value)}
              className="p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 shadow-sm font-bold text-slate-600 cursor-pointer px-8 text-sm md:w-64 appearance-none"
            >
              {ACTIVITY_FILTERS.map((filter) => (
                <option key={filter} value={filter}>
                  {filter === "Все" ? "🎯 Все активности" : filter}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Счётчик результатов */}
        {!state.isLoading && (
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
                className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors"
              >
                ✕ Сбросить фильтры
              </button>
            )}
          </div>
        )}

        {/* Форма добавления (теперь без пропсов!) */}
        <AddStudentForm />

        {/* Список учеников */}
        {state.isLoading ? (
          <div className="flex justify-center p-12">
            <div className="flex items-center gap-3 text-slate-400 animate-pulse">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="font-black uppercase tracking-widest text-xs">
                Загрузка данных...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {state.totalCount === 0 ? (
              <div className="bg-white p-16 rounded-[40px] border-2 border-dashed border-slate-200 text-center space-y-4">
                <div className="text-4xl">🤷‍♂️</div>
                <p className="text-slate-400 font-medium">
                  Никто не подходит под эти параметры
                </p>
              </div>
            ) : (
              state.students.map((item) => (
                <StudentCard
                  key={item.student.id}
                  item={item}
                  weeklySteps={actions.getWeeklySteps(item)}
                  onClick={() => actions.setSelectedStudent(item)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {state.selectedStudent && (
        <StudentModal
        // Если StudentModal требует пропсы, передаем их из state.selectedStudent
        // Если он берет их из стора сам — оставляем так
        />
      )}
    </div>
  );
}
