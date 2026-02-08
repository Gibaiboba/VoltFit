"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";
import { UserPlus, Search, Loader2 } from "lucide-react";
import { PostgrestError } from "@supabase/supabase-js";

export default function AddStudentForm({
  onStudentAdded,
}: {
  onStudentAdded: () => void;
}) {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { user: coach } = useUserStore();

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetEmail = email.toLowerCase().trim();
    if (!targetEmail) return;
    if (!coach) return toast.error("Вы не авторизованы");

    setIsPending(true);

    try {
      //  Поиск ученика
      const { data: student, error: searchError } = await supabase
        .from("profiles")
        .select("id, full_name, role, email")
        .eq("email", targetEmail)
        .single();

      if (searchError || !student) {
        throw new Error("Пользователь с таким Email не найден");
      }

      // Проверка логики
      if (student.id === coach.id) {
        throw new Error("Вы не можете добавить самого себя");
      }

      if (student.role !== "student") {
        throw new Error("Этот пользователь зарегистрирован как тренер");
      }

      // Проверяем, не добавлен ли он уже
      const { data: existing, error: checkError } = await supabase
        .from("coach_students")
        .select("id")
        .eq("coach_id", coach.id)
        .eq("student_id", student.id)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) throw new Error("Этот ученик уже есть в вашем списке");

      // Создаем связь
      const { error: linkError } = await supabase
        .from("coach_students")
        .insert({
          coach_id: coach.id,
          student_id: student.id,
        });

      if (linkError) throw linkError;

      toast.success(`Ученик ${student.full_name} успешно добавлен!`);
      setEmail("");
      onStudentAdded();
    } catch (err: unknown) {
      console.error("Add Student Error:", err);

      let message = "Произошла ошибка при добавлении";

      // Проверяем, является ли ошибка обычным объектом Error
      if (err instanceof Error) {
        message = err.message;
      }
      // Проверяем, является ли это ошибкой Supabase
      else if (isPostgrestError(err)) {
        message =
          err.code === "23505" ? "Этот ученик уже привязан к вам" : err.message;
      }

      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  /**
   * Type Guard для проверки типа ошибки Supabase
   */
  function isPostgrestError(err: unknown): err is PostgrestError {
    return (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      "message" in err
    );
  }

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
            className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none focus:border-blue-500 border-2 border-transparent transition-all text-slate-800 disabled:opacity-50"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !email.includes("@")}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2 min-w-[140px]"
        >
          {isPending ? (
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
