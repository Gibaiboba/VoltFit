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
    <div className="bg-slate-900 rounded-[45px] p-8 text-white shadow-2xl relative overflow-hidden mb-8">
      <div className="flex justify-between items-center relative z-10">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
            Сегодня съедено
          </span>
          <div className="text-5xl font-black italic">
            {Math.round(current)}
            <span className="text-xl opacity-30 ml-2">/ {target}</span>
          </div>
          <div className="text-lg font-black italic text-emerald-400">
            Осталось: {caloriesLeft} ккал
          </div>
        </div>
        <ProgressCircle progress={progress} />
      </div>

      {/* Декоративный элемент фонового свечения */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
    </div>
  );
}
