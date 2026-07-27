interface SaveButtonProps {
  onClick: () => void;
  isSaving: boolean;
  hasLog: boolean;
}

export function SaveButton({ onClick, isSaving, hasLog }: SaveButtonProps) {
  // Базовый темный цвет для активного состояния (Slate-900)
  const activeBg = "bg-slate-900";

  return (
    <div className="w-full">
      <button
        onClick={onClick}
        disabled={isSaving}
        className={`
          w-full py-4 mb-6 rounded-2xl font-bold uppercase tracking-wider text-xs
          transition-all duration-200 active:scale-[0.98] 
          disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-sm
          ${
            isSaving
              ? "bg-slate-50 text-slate-400 border border-slate-100"
              : `${activeBg} text-white hover:bg-slate-800 border border-transparent`
          }
        `}
      >
        {isSaving ? (
          <>
            {/* Тонкий минималистичный спиннер */}
            <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
            <span className="font-medium normal-case tracking-normal text-slate-500">
              Синхронизация...
            </span>
          </>
        ) : (
          <>
            {/* Заменили эмодзи на текстовое состояние или иконки, если потребуется */}
            <span>
              {hasLog ? "Обновить данные" : "Зафиксировать результат"}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
