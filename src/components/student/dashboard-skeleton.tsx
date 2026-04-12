// components/student/dashboard-skeleton.tsx
import { Calendar, Scale, Footprints, Moon, Droplets } from "lucide-react";

export function DashboardSkeleton() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen pt-24 pb-12 animate-pulse">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl relative overflow-hidden">
          {/* Прогресс-бар */}
          <div className="h-2 bg-slate-100 rounded-full mb-8 w-full" />

          {/* Навигация */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-slate-50 p-2 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-2 px-4 py-2 w-32">
              <Calendar className="w-4 h-4 text-slate-200" />
              <div className="h-4 bg-slate-200 w-20 rounded" />
            </div>
            <div className="w-28 h-10 bg-slate-200 rounded-2xl" />
          </div>

          {/* Макросы */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-2"
              >
                <div className="w-8 h-8 bg-slate-100 rounded-full" />
                <div className="h-3 bg-slate-100 w-12 rounded" />
              </div>
            ))}
          </div>

          {/* Баннер калорий */}
          <div className="h-24 bg-slate-50 rounded-3xl mb-8 border border-slate-100" />

          {/* Кнопка "Добавить еду" */}
          <div className="h-14 bg-slate-100 rounded-2xl mb-8" />

          {/* Сетка метрик */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { Icon: Droplets },
              { Icon: Scale },
              { Icon: Footprints },
              { Icon: Moon },
            ].map((item, idx) => (
              <div
                key={idx}
                className="h-28 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-2"
              >
                <item.Icon className="w-5 h-5 text-slate-200" />
                <div className="h-3 bg-slate-100 w-10 rounded" />
              </div>
            ))}
          </div>

          {/* Кнопка сохранения */}
          <div className="h-16 bg-slate-200 rounded-[32px]" />
        </div>

        {/* История отчетов */}
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 w-48 rounded-md mb-4" />
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-20 bg-white rounded-3xl border border-slate-100"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
