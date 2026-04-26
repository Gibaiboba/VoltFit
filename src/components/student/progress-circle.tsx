export const ProgressCircle = ({ progress }: { progress: number }) => {
  // Длина окружности (2 * PI * R), где R=40
  const circumference = 2 * Math.PI * 40;
  const offset =
    circumference - (circumference * Math.min(progress, 100)) / 100;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center scale-110">
      <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(250,204,21,0.2)]">
        {/* Фоновый круг (пустая часть трека) */}
        <circle
          cx="48"
          cy="48"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-white/5"
        />
        {/* Активный круг (заряд) */}
        <circle
          cx="48"
          cy="48"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          className="text-yellow-400 transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Текст внутри */}
      <div className="absolute flex flex-col items-center justify-center leading-none">
        <span className="text-xl font-black text-white tracking-tighter">
          {Math.round(progress)}
        </span>
        <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest">
          %
        </span>
      </div>

      {/* Эффект свечения в центре для объема */}
      <div className="absolute inset-4 bg-yellow-400/5 rounded-full blur-md -z-10" />
    </div>
  );
};
