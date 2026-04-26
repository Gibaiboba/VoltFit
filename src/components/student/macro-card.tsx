interface MacroCardProps {
  label: string;
  current: number;
  target: number;
  colors: {
    stroke: string;
    bg: string;
    accent: string;
  };
}
export const MacroCard = ({
  label,
  current,
  target,
  colors,
}: MacroCardProps) => {
  const progress = target > 0 ? (current / target) * 100 : 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (circumference * Math.min(progress, 100)) / 100;

  return (
    <div className="bg-slate-950 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-center relative overflow-hidden w-full transition-all hover:scale-[1.05] group">
      {/* Заголовок */}
      <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">
        {label}
      </span>

      <div className="relative w-32 h-32 mb-4 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full -rotate-90 overflow-visible"
        >
          {/* Фильтр для неонового свечения */}
          <defs>
            <filter id={`glow-${label}`}>
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Темный трек */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
          />

          {/* Активное неоновое кольцо */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            filter={`url(#glow-${label})`} // Применяем неон
            className="transition-all duration-[1500ms] ease-in-out"
            style={{
              // Дополнительное свечение через CSS для браузеров
              filter: `0 0 8px ${colors.stroke}`,
            }}
          />
        </svg>

        {/* Значение в центре */}
        <div className="absolute flex flex-col items-center leading-none">
          <span
            className="text-3xl font-black italic tracking-tighter transition-all"
            style={{
              color: colors.stroke,
              textShadow: `0 0 12px ${colors.stroke}80`, // Неоновый текст
            }}
          >
            {Math.round(current)}
          </span>
          <span className="text-[9px] font-bold text-slate-500 uppercase mt-1">
            из {target}г
          </span>
        </div>
      </div>

      {/* Процент внизу */}
      <div
        className="text-[10px] font-black px-4 py-1.5 rounded-full border border-white/10 shadow-lg"
        style={{
          color: colors.stroke,
          backgroundColor: `${colors.stroke}15`,
          boxShadow: `0 0 10px ${colors.stroke}20`,
        }}
      >
        {Math.round(progress)}% ГОТОВО
      </div>

      {/* Декоративное фоновое свечение (Ambient light) */}
      <div
        className="absolute -right-8 -bottom-8 w-20 h-20 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: colors.stroke }}
      />
    </div>
  );
};
