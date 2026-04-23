"use client";
import { useMemo, useEffect } from "react";
import { useCoachStore } from "@/store/useCoachStore";
import { useMealHistory } from "@/hooks/use-meal-history";
import { StudentDayRow } from "./StudentDayRow";
import { toISODate } from "@/lib/utils/date-utils";

export default function StudentModal() {
  const { selectedStudent, setSelectedStudent } = useCoachStore();
  const { meals } = useMealHistory(selectedStudent?.student.id);

  // Блокировка прокрутки фона
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const timeline = useMemo(() => {
    if (!selectedStudent) return [];

    const logs = selectedStudent.student.daily_logs || [];

    // 1. Быстрая индексация логов O(1)
    const logsMap = new Map(logs.map((l) => [l.log_date, l]));

    // 2. Группировка еды по датам (один проход)
    const mealsByDate = new Map<string, typeof meals>();
    meals.forEach((meal) => {
      const dateKey = toISODate(new Date(meal.created_at));
      if (!mealsByDate.has(dateKey)) {
        mealsByDate.set(dateKey, []);
      }
      mealsByDate.get(dateKey)!.push(meal);
    });

    // 3. Уникальные даты, отсортированные от новых к старым
    const allDates = Array.from(
      new Set([...logsMap.keys(), ...mealsByDate.keys()]),
    ).sort((a, b) => b.localeCompare(a));

    // 4. Сборка ленты
    return allDates.map((date) => ({
      date,
      dayLog: logsMap.get(date),
      dayMeals: mealsByDate.get(date) || [],
    }));
  }, [selectedStudent, meals]);

  if (!selectedStudent) return null;

  // Закрытие по клику на оверлей
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setSelectedStudent(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-slate-50 w-full max-w-2xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col scale-in-center">
        {/* Шапка */}
        <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-800 leading-tight">
              {selectedStudent.student.full_name}
            </h2>
            <p className="text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">
              Единая лента активности
            </p>
          </div>
          <button
            onClick={() => setSelectedStudent(null)}
            className="w-10 h-10 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full font-black transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Лента событий */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
          {timeline.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-medium">
              Данные за выбранный период отсутствуют
            </div>
          ) : (
            timeline.map((item) => (
              <StudentDayRow
                key={item.date}
                date={item.date}
                log={item.dayLog}
                meals={item.dayMeals}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
