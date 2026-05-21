import { ProgressBar } from "@/components/student/progress-bar";

interface CaloriesBannerProps {
  current: number;
  target: number;
  progress: number;
}

export default function CaloriesBanner({
  current = 0,
  target = 0,
  progress = 0,
}: CaloriesBannerProps) {
  const roundedCurrent = Math.round(current) || 0;
  const validTarget = target > 0 ? target : 0;
  const caloriesLeft = Math.max(0, validTarget - roundedCurrent);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-xl shadow-slate-100/50 relative overflow-hidden mb-8 border border-slate-100">
      <div className="flex flex-col relative z-10">
        {/* Верхняя строка: Калории и Остаток */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Левая часть: Употреблено */}
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">
              Калории
            </span>
            <div className="flex flex-col">
              <div className="text-4xl sm:text-5xl font-black tracking-tighter leading-none flex items-baseline justify-center sm:justify-start">
                {roundedCurrent}
                <span className="text-base sm:text-lg font-bold text-slate-400 ml-2 tracking-normal">
                  / {validTarget}
                </span>
              </div>
            </div>
          </div>

          {/* Правая часть: Осталось */}
          <div className="flex justify-center sm:justify-end">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-400 rounded-full border border-slate-100 heavy-shadow">
              <span className="text-xs font-black uppercase tracking-tight ">
                Осталось:{" "}
                <span className="text-black">{caloriesLeft} ккал</span>
              </span>
            </div>
          </div>
        </div>

        {/* Нижняя часть: Прогресс-бар на всю ширину */}
        <div className="w-full pt-2 border-t border-slate-50">
          <ProgressBar progress={progress} />
        </div>
      </div>

      {/* Мягкое фоновое свечение (теперь синее) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
    </div>
  );
}
