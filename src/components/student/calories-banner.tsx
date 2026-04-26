import { ProgressCircle } from "./progress-circle";

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
  const caloriesLeft = Math.max(0, target - Math.round(current));

  return (
    <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden mb-8 border border-white/5">
      <div className="grid grid-cols-3 items-center relative z-10">
        {/* Левая часть: Как тебе нравилось */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400/80">
              Энергия дня
            </span>
          </div>

          <div className="flex flex-col">
            <div className="text-5xl font-black tracking-tighter leading-none flex items-baseline">
              {Math.round(current)}
              <span className="text-lg font-bold text-slate-500 ml-2 tracking-normal">
                / {target}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1">
              ккал употреблено
            </span>
          </div>
        </div>

        {/* Центр: Круг идеально по середине */}
        <div className="flex justify-center">
          <div className="scale-125 origin-center">
            <ProgressCircle progress={progress} />
          </div>
        </div>

        {/* Правая часть: Только "Осталось" */}
        <div className="flex justify-end">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <span className="text-xs font-black uppercase tracking-tight text-slate-300">
              Осталось:{" "}
              <span className="text-yellow-400">{caloriesLeft} ккал</span>
            </span>
          </div>
        </div>
      </div>

      {/* Фоновое свечение за кругом */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/5 rounded-full blur-[100px]" />
    </div>
  );
}
