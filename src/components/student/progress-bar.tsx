interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const validatedProgress = Math.max(0, Math.min(progress, 100));

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Проценты над баром */}
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
          Употреблено
        </span>
        <div className="flex items-baseline leading-none">
          <span className="text-base font-black text-slate-800 tracking-tighter">
            {Math.round(progress)}
          </span>
          <span className="text-[10px] font-black text-yellow-500 uppercase tracking-wider ml-0.5">
            %
          </span>
        </div>
      </div>

      {/* Линия прогресса */}
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${validatedProgress}%` }}
        />
        {/* Внутреннее свечение */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
