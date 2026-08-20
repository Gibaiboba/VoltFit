"use client";
import { DailyLog } from "@/types/shared";
import { LoggedActivity } from "@/hooks/use-student-dashboard/types";
import { ACTIVITIES_MAP } from "@/constants/activities";
import { Dumbbell, Flame } from "lucide-react";

interface DayActivitiesListProps {
  log?: DailyLog;
  totalBurnedCalories: number;
}

export function DayActivitiesList({
  log,
  totalBurnedCalories,
}: DayActivitiesListProps) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">
        Активности
      </p>

      {log && log.activities && log.activities.length > 0 ? (
        <div className="space-y-2">
          <div className="grid gap-2">
            {log.activities.map((act: LoggedActivity) => {
              const config = ACTIVITIES_MAP[act.activity_id];
              return (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-3.5 bg-amber-50/40 border border-amber-100 rounded-2xl shadow-inner animate-in fade-in duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-700">
                        {config ? config.name : "Тренировка"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        Время:{" "}
                        <span className="text-slate-600">
                          {act.duration} мин
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-black text-amber-600 bg-white border border-amber-200 px-3 py-1.5 rounded-xl shadow-sm">
                    <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    +{act.burned_calories} ккал
                  </div>
                </div>
              );
            })}
          </div>

          {totalBurnedCalories > 0 && (
            <div className="px-1 text-right">
              <p className="text-[11px] font-black text-amber-600 uppercase tracking-tight italic">
                За день: +{totalBurnedCalories} ккал
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic px-1">
          Активностей за этот день не зафиксировано
        </p>
      )}
    </div>
  );
}
