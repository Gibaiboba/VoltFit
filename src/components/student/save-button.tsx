interface SaveButtonProps {
  onClick: () => void;
  isSaving: boolean;
  hasLog: boolean;
}

export function SaveButton({ onClick, isSaving, hasLog }: SaveButtonProps) {
  return (
    <div className="relative group w-full">
      {/* Слой внешнего свечения (Glow), который усиливается при наведении */}
      <div
        className={`absolute -inset-1 bg-yellow-400 rounded-[2.5rem] blur-xl opacity-20 transition-opacity duration-500 ${isSaving ? "animate-pulse" : "group-hover:opacity-40"}`}
      />

      <button
        onClick={onClick}
        disabled={isSaving}
        className={`
          relative w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[13px]
          transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-3 overflow-hidden
          ${
            isSaving
              ? "bg-slate-900 text-yellow-400 border border-yellow-400/20"
              : "bg-yellow-400 text-black hover:bg-yellow-300 shadow-[0_20px_40px_rgba(250,204,21,0.2)]"
          }
        `}
      >
        {/* Эффект блика, проходящего по кнопке */}
        {!isSaving && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        )}

        {isSaving ? (
          <>
            <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
            <span>Синхронизация...</span>
          </>
        ) : (
          <>
            <span className="text-lg">{hasLog ? "⚡" : "🔋"}</span>
            <span>
              {hasLog ? "Обновить данные" : "Зафиксировать результат"}
            </span>
          </>
        )}
      </button>

      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
