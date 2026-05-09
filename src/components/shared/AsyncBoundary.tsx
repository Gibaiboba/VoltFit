"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { ReactNode } from "react";

interface AsyncBoundaryProps {
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  skeleton: ReactNode;
  children: ReactNode;
}

export default function AsyncBoundary({
  isLoading,
  error,
  onRetry,
  skeleton,
  children,
}: AsyncBoundaryProps) {
  // 1. Состояние первой загрузки — показываем переданный скелетон страницы
  if (isLoading) return <>{skeleton}</>;

  // 2. Состояние критического сбоя сети
  if (error) {
    return (
      <div className="mt-24 max-w-md mx-auto p-8 text-center bg-[#080808] border border-white/5 rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden animate-in fade-in duration-300">
        {/* Верхняя неоновая полоса */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400" />

        <AlertCircle
          className="mx-auto text-yellow-400 mb-4 animate-pulse"
          size={48}
        />

        <h2 className="text-slate-100 font-black text-lg mb-2 italic uppercase tracking-wider">
          Сбой синхронизации
        </h2>

        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-6 leading-relaxed">
          {error}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-yellow-400/10 flex items-center justify-center gap-2 active:scale-95"
          >
            <RefreshCw size={14} /> Повторить попытку
          </button>
        )}
      </div>
    );
  }

  // 3. Успешный рендер страницы
  return <>{children}</>;
}
