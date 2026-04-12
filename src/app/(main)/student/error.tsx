"use client";

import { useEffect } from "react";

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Тут можно отправить ошибку в логгер
    console.error("Ошибка на странице студента:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 max-w-md">
        <h2 className="text-2xl font-black text-slate-800 mb-4">
          Упс! Данные не подгрузились
        </h2>
        <p className="text-slate-500 mb-8 font-medium">
          Скорее всего, это временная проблема со связью. Попробуйте обновить
          страницу.
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
        >
          🔄 Повторить попытку
        </button>
      </div>
    </div>
  );
}
