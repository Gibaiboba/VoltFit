"use client";
import { StudentDayRow } from "./StudentDayRow";
import { TimelineItem, CoachStudent } from "@/hooks/coach/use-student-timeline";
import { Loader2 } from "lucide-react";

interface DailyTimelineTabProps {
  timeline: TimelineItem[];
  selectedStudent: CoachStudent;
  loadMore: () => void;
  isFetching: boolean;
}

export function DailyTimelineTab({
  timeline,
  selectedStudent,
  loadMore,
  isFetching,
}: DailyTimelineTabProps) {
  if (timeline.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400 font-medium">
        Данные за выбранный период отсутствуют
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timeline.map((item) => (
        <StudentDayRow
          key={item.date}
          date={item.date}
          log={item.dayLog}
          meals={item.dayMeals}
          baseCalories={selectedStudent.student.daily_calories || 2000}
          studentWeight={selectedStudent.student?.weight || 70}
          studentGender={selectedStudent.student?.gender || "female"}
        />
      ))}

      {/* Кнопка пагинации */}
      <div className="pt-4 pb-24 flex justify-center">
        <button
          onClick={loadMore}
          disabled={isFetching}
          className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center gap-2 disabled:opacity-60"
        >
          {isFetching ? (
            <>
              <Loader2 className="animate-spin text-blue-600" size={14} />
              <span>Загрузка...</span>
            </>
          ) : (
            <span>Загрузить еще 14 дней</span>
          )}
        </button>
      </div>
    </div>
  );
}
