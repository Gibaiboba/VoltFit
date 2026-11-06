import React from "react";

interface RestTimerModalProps {
  restTimeLeft: number;
  onAddSeconds: () => void;
  onSkip: () => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  restTimeLeft,
  onAddSeconds,
  onSkip,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/95 backdrop-blur-md text-white px-6 py-4 rounded-3xl shadow-2xl z-50 flex items-center gap-4 border border-slate-800 animate-in slide-in-from-bottom duration-300 w-[92%] max-w-sm">
      <div className="flex flex-col text-left justify-center flex-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">
          Время отдыха
        </span>
        <span className="text-2xl font-black tabular-nums tracking-tight">
          {Math.floor(restTimeLeft / 60)}:
          {(restTimeLeft % 60).toString().padStart(2, "0")}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onAddSeconds}
          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-black uppercase tracking-wider rounded-xl transition-colors active:scale-95"
        >
          +30с
        </button>
        <button
          onClick={onSkip}
          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-900/20 active:scale-95"
        >
          Пропустить
        </button>
      </div>
    </div>
  );
};
