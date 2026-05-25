interface MacroItem {
  label: string;
  current: number;
  target: number;
  colors: {
    stroke: string;
    bg?: string;
    accent?: string;
  };
}

interface MacrosComboCardProps {
  macros: MacroItem[];
}

export const MacrosComboCard = ({ macros }: MacrosComboCardProps) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm w-full">
      {/* Сетка в три колонки для мобильных и десктопа */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {macros.map((m) => {
          const progress = m.target > 0 ? (m.current / m.target) * 100 : 0;
          const cappedProgress = Math.min(progress, 100);

          return (
            <div key={m.label} className="flex flex-col gap-2">
              {/* Шапка: Название + Процент */}
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-500 tracking-wider truncate">
                  {m.label}
                </span>
                <span
                  className="text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-md shrink-0"
                  style={{
                    color: m.colors.stroke,
                    backgroundColor: `${m.colors.stroke}12`,
                  }}
                >
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Прогресс-бар (Линия) */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${cappedProgress}%`,
                    backgroundColor: m.colors.stroke,
                    // Эффект легкого свечения полосы
                    boxShadow: `0 0 8px ${m.colors.stroke}40`,
                  }}
                />
              </div>

              {/* Нижние цифры: Текущее / Цель */}
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span
                  className="text-base sm:text-lg font-black italic tracking-tight"
                  style={{ color: m.colors.stroke }}
                >
                  {Math.round(m.current)}
                </span>
                <span className="text-[9px] sm:text-xs font-medium text-slate-400">
                  / {m.target}г
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
