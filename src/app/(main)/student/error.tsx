"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Логирование критического сбоя самого интерфейса (а не сети)
    console.error("Критический сбой JS-кода в VoltFit:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F4F5] p-6 text-center pt-24 pb-44 animate-in fade-in duration-300">
      <div className="bg-[#080808] border border-white/5 p-10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-md w-full relative overflow-hidden">
        {/* Верхняя акцентная полоса бренда */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />

        <AlertTriangle
          className="mx-auto text-yellow-400 mb-6 animate-pulse"
          size={56}
        />

        <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider italic mb-3">
          Сбой интерфейса
        </h2>

        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8 leading-relaxed">
          Произошла критическая ошибка приложения. Данные сессии повреждены. Мы
          уже зафиксировали сбой.
        </p>

        <button
          onClick={() => reset()}
          className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-lg shadow-yellow-400/10 flex items-center justify-center gap-2 active:scale-95"
        >
          <RefreshCw size={14} /> Перезапустить сессию
        </button>
      </div>
    </div>
  );
}
