"use client";
import { useState } from "react";
import { useCoachStore } from "@/store/useCoachStore";
import { useMealHistory } from "@/hooks/use-meal-history";
import {
  useStudentTimeline,
  CoachStudent,
} from "@/hooks/coach/use-student-timeline";
import { DailyTimelineTab } from "./DailyTimelineTab";
import { AveragesTab } from "./AveragesTab";

export default function StudentModal() {
  const { selectedStudent, setSelectedStudent } = useCoachStore() as {
    selectedStudent: CoachStudent | null;
    setSelectedStudent: (student: CoachStudent | null) => void;
  };

  const [activeTab, setActiveTab] = useState<"daily" | "averages">("daily");

  const { meals, loadMore, isFetching, daysLimit } = useMealHistory(
    selectedStudent?.student.id,
  );

  const { weeklyAverages, timeline } = useStudentTimeline({
    selectedStudent,
    meals,
    daysLimit,
  });

  if (!selectedStudent) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setSelectedStudent(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-slate-50 w-full h-full shadow-2xl overflow-hidden flex flex-col scale-in-center">
        {/* Шапка модального окна */}
        <div className="p-6 md:p-8 bg-white flex justify-between items-center shrink-0">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
            {selectedStudent.student.full_name}
          </h2>
          <button
            onClick={() => setSelectedStudent(null)}
            className="w-8 h-8 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full text-xs font-black transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* 📑 Переключатель табов по центру */}
        <div className="bg-white px-6 md:px-8 pb-3 flex justify-center shrink-0">
          <div className="flex gap-3 p-1">
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-5 py-2 text-xs md:text-sm font-bold rounded-full transition-all ${
                activeTab === "daily"
                  ? "bg-blue-600 text-white shadow-md font-black"
                  : "bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200"
              }`}
            >
              Данные по дням
            </button>
            <button
              onClick={() => setActiveTab("averages")}
              className={`px-5 py-2 text-xs md:text-sm font-bold rounded-full transition-all ${
                activeTab === "averages"
                  ? "bg-blue-600 text-white shadow-md font-black"
                  : "bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200"
              }`}
            >
              Средние значения
            </button>
          </div>
        </div>

        {/* Контейнер контента */}
        <div className="overflow-y-auto p-3 flex-1 custom-scrollbar">
          {activeTab === "daily" ? (
            <DailyTimelineTab
              timeline={timeline}
              selectedStudent={selectedStudent}
              loadMore={loadMore}
              isFetching={isFetching}
            />
          ) : (
            <AveragesTab averages={weeklyAverages} />
          )}
        </div>
      </div>
    </div>
  );
}
