"use client";
import { useEffect } from "react";
import { useCoachStore } from "@/store/useCoachStore";
import AddStudentForm from "@/components/coach/AddStudentForm";
import StudentCard from "@/components/coach/StudentCard";
import StudentModal from "@/components/coach/StudentModal";

const ACTIVITY_FILTERS = [
  "Все",
  "Силовая тренировка",
  "Кардио тренировка",
  "Групповая тренировка",
  "День без тренировок",
];

export default function CoachDashboard() {
  const {
    loading,
    selectedStudent,
    fetchStudents,
    setSelectedStudent,
    getWeeklySteps,
    searchQuery,
    setSearchQuery,
    selectedActivity,
    setSelectedActivity,
    getFilteredStudents,
  } = useCoachStore();

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = getFilteredStudents();

  // Функция для сброса всех фильтров
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedActivity("Все");
  };

  return (
    <div className="p-6 bg-slate-50 pt-24 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Шапка и Фильтры */}
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Панель <span className="text-blue-600">Тренера</span>
          </h1>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Поиск по имени */}
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Поиск ученика по имени..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 pl-12 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 shadow-sm transition-all font-semibold text-slate-700"
              />
            </div>

            {/* Фильтр по активности */}
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 shadow-sm font-bold text-slate-600 cursor-pointer appearance-none px-8 text-sm md:w-64"
            >
              {ACTIVITY_FILTERS.map((filter) => (
                <option key={filter} value={filter}>
                  {filter === "Все" ? "🎯 Все активности" : filter}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Форма добавления ученика */}
        <AddStudentForm onStudentAdded={fetchStudents} />

        {/* Список учеников */}
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="flex items-center gap-3 text-slate-400 animate-pulse">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="font-black uppercase tracking-widest text-xs">
                Обновление данных
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredStudents.length === 0 ? (
              <div className="bg-white p-16 rounded-[40px] border-2 border-dashed border-slate-200 text-center space-y-4">
                <p className="text-slate-400 font-medium italic">
                  {searchQuery || selectedActivity !== "Все"
                    ? "Никто не подходит под эти фильтры"
                    : "Список учеников пуст"}
                </p>
                {(searchQuery || selectedActivity !== "Все") && (
                  <button
                    onClick={resetFilters}
                    className="text-blue-600 font-black text-xs uppercase tracking-tighter hover:underline"
                  >
                    Сбросить все фильтры
                  </button>
                )}
              </div>
            ) : (
              filteredStudents.map((item, i) => (
                <StudentCard
                  key={i}
                  item={item}
                  weeklySteps={getWeeklySteps(item)}
                  onClick={() => setSelectedStudent(item)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Модалка с историей */}
      {selectedStudent && <StudentModal />}
    </div>
  );
}
