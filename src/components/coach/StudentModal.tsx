"use client";
import { useMemo } from "react";
import { useCoachStore } from "@/store/useCoachStore";
import { useMealHistory } from "@/hooks/use-meal-history";
import { StudentDayRow } from "./StudentDayRow";
import { toISODate } from "@/lib/utils/date-utils";

export default function StudentModal() {
  const { selectedStudent, setSelectedStudent } = useCoachStore();
  const { meals } = useMealHistory(selectedStudent?.student.id);

  // Оптимизируем расчеты через useMemo
  const timeline = useMemo(() => {
    if (!selectedStudent) return [];

    // Создаем список уникальных дат
    const logs = selectedStudent.student.daily_logs || [];
    const logDates = logs.map((l) => l.log_date);
    const mealDates = meals.map((m) => toISODate(new Date(m.created_at)));

    const uniqueDates = Array.from(new Set([...logDates, ...mealDates])).sort(
      (a, b) => b.localeCompare(a),
    );

    // Предварительно подготавливаем данные для каждого дня
    return uniqueDates.map((date) => ({
      date,
      dayLog: logs.find((l) => l.log_date === date),
      dayMeals: meals.filter((m) => toISODate(new Date(m.created_at)) === date),
    }));
  }, [selectedStudent, meals]);

  if (!selectedStudent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
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
            className="w-10 h-10 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full font-black transition-colors"
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
