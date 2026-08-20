"use client";

import { useCallback } from "react";
import { useCoachDashboard } from "@/hooks/coach/use-coach-dashboard";
import AddStudentForm from "@/components/coach/AddStudentForm";
import StudentCard from "@/components/coach/StudentCard";
import StudentModal from "@/components/coach/StudentModal";
import { StudentView } from "@/types/coach";
import { X } from "lucide-react";

export default function CoachDashboard() {
  const { state, actions } = useCoachDashboard();

  const handleStudentClick = useCallback(
    (student: StudentView) => {
      actions.setSelectedStudent(student);
    },
    [actions],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      actions.setSearchQuery(e.target.value);
    },
    [actions],
  );

  return (
    <div className="p-6 bg-slate-50 pt-19 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Шапка панели */}
        <div className="flex flex-col gap-6">
          {/* Заголовок со встроенным бэйджем количества */}
          <h1 className="text-3xl font-black text-slate-800 tracking-tight text-center flex items-center justify-center gap-3">
            <span>Панель тренера</span>

            {/* Бэйдж рендерится только если данные загружены и ученики есть */}
            {!state.isLoading && !state.isError && state.totalCount > 0 && (
              <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-extrabold bg-blue-50 text-blue-600 rounded-full border border-blue-100 animate-in fade-in zoom-in-95 duration-200">
                {state.totalCount}
              </span>
            )}
          </h1>

          {/* Строка поиска и кнопка добавления в один ряд */}
          <div className="flex flex-row items-center gap-3 w-full">
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

            {/* Кнопка добавления в ряду поиска */}
            <div className="shrink-0">
              <AddStudentForm
                isPending={state.isAdding}
                onAdd={(email, opts) => actions.addStudent(email, opts)}
              />
            </div>
          </div>
        </div>

        {/* Индикатор ошибки загрузки */}
        {state.isError && (
          <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[32px] text-center">
            <p className="text-red-600 font-bold">Ошибка при загрузке данных</p>
          </div>
        )}

        {/* Список учеников */}
        {state.isLoading ? (
          <div className="flex justify-center p-12 animate-pulse text-slate-400 font-black uppercase tracking-widest text-xs">
            Загрузка данных...
          </div>
        ) : (
          <div className="grid gap-6">
            {state.totalCount === 0 && !state.isError ? (
              <div className="bg-white p-16 rounded-[40px] border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200">
                <span className="text-slate-400 font-medium">
                  Никого не найдено
                </span>
                {state.searchQuery && (
                  <button
                    onClick={() => actions.setSearchQuery("")}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 rounded-xl transition-all border border-slate-200/60"
                  >
                    ✕ Сбросить поиск
                  </button>
                )}
              </div>
            ) : (
              state.students.map((item) => (
                <StudentCard
                  key={item.student.id}
                  item={item}
                  weeklySteps={item.weeklySteps}
                  onClick={handleStudentClick}
                  onRemove={(id) => actions.removeStudent(id)}
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
