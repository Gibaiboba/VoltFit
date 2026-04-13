"use client";

import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useCoachMutations } from "@/hooks/coach/use-mutations";
import { UserPlus, Search, Loader2 } from "lucide-react";

export default function AddStudentForm() {
  const [email, setEmail] = useState("");
  const { user: coach } = useUserStore();

  const { addStudentMutation } = useCoachMutations();

  const handleAddStudent = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const targetEmail = email.toLowerCase().trim();
    if (!targetEmail || !coach) return;

    addStudentMutation.mutate(
      { email: targetEmail, coachId: coach.id },
      {
        onSuccess: () => {
          setEmail("");
        },
      },
    );
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
            disabled={addStudentMutation.isPending}
            className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none focus:border-blue-500 border-2 border-transparent transition-all text-slate-800 disabled:opacity-50"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
        </div>
        <button
          type="submit"
          disabled={addStudentMutation.isPending || !email.includes("@")}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2 min-w-[140px]"
        >
          {addStudentMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Поиск...</span>
            </>
          ) : (
            "Добавить"
          )}
        </button>
      </form>
    </div>
  );
}
