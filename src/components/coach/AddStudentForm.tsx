"use client";

import { useState } from "react";
import { UserPlus, Search, Loader2, X } from "lucide-react";

// Интерфейс пропсов для связи с useCoachDashboard
interface AddStudentFormProps {
  isPending: boolean;
  onAdd: (email: string, options?: { onSuccess?: () => void }) => void;
}

export default function AddStudentForm({
  isPending,
  onAdd,
}: AddStudentFormProps) {
  const [email, setEmail] = useState("");

  const handleAddStudent = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const targetEmail = email.toLowerCase().trim();
    if (!targetEmail || isPending) return;

    // Вызываем метод из хука и передаем коллбэк для очистки поля при успехе
    onAdd(targetEmail, {
      onSuccess: () => setEmail(""),
    });
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8">
      <div className="flex items-center gap-3 mb-4 text-slate-800">
        <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
          <UserPlus size={20} />
        </div>
        <h2 className="font-bold text-lg">Добавить ученика</h2>
      </div>

      <form
        onSubmit={handleAddStudent}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <input
            type="email"
            placeholder="Введите email ученика..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            className="w-full p-4 pl-12 pr-12 bg-slate-50 rounded-2xl outline-none focus:border-blue-500 border-2 border-transparent transition-all text-slate-800 disabled:opacity-50"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />

          {/* Кнопка очистки email (появляется только если есть текст и нет загрузки) */}
          {email && !isPending && (
            <button
              type="button"
              onClick={() => setEmail("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || !email.includes("@")}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:bg-slate-100 disabled:text-slate-400 flex items-center justify-center gap-2 min-w-[160px]"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Добавление...</span>
            </>
          ) : (
            "Добавить"
          )}
        </button>
      </form>
    </div>
  );
}
