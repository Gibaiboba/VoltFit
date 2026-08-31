"use client";

import { ACTIVITIES_MAP } from "@/constants/activities";

// Описываем тип для одной активности из formData
interface LoggedActivity {
  activity_id: string;
  duration: number;
}

interface ActivitySectionProps {
  activities: LoggedActivity[] | undefined;
  onOpenModal: () => void;
}

export function ActivitySection({
  activities,
  onOpenModal,
}: ActivitySectionProps) {
  return (
    <button
      onClick={onOpenModal}
      className="flex items-start justify-between w-full p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-200 hover:bg-slate-50/50 transition-all group cursor-pointer text-left gap-4"
    >
      {/* Левая часть: Название секции и список активностей */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Активность
        </p>

        {activities && activities.length > 0 ? (
          // Выводим активности списком друг под другом
          <div className="space-y-1">
            {activities.map((act, index) => {
              const nameWithEmoji =
                ACTIVITIES_MAP[act.activity_id]?.name || "🏋️ Тренировка";
              const cleanName = nameWithEmoji.split(" ").slice(1).join(" ");

              return (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm font-bold text-slate-700"
                >
                  {/* Компактный маркер списка */}
                  <span className="w-1 h-1 rounded-full bg-orange-400 shrink-0" />
                  <span className="break-words">
                    {cleanName} ({act.duration} мин)
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          // Если тренировок нет
          <p className="text-sm font-bold text-slate-400 italic">
            День без тренировок
          </p>
        )}
      </div>

      {/* Правая часть: Круглая кнопка-плюс */}
      <span className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-lg font-black text-orange-500 bg-orange-50/50 group-hover:bg-orange-100 transition-colors self-center">
        +
      </span>
    </button>
  );
}
