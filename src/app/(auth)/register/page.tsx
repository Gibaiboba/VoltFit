"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "coach">("student");
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      return toast.error("Заполните все поля", {
        description: "Для регистрации необходимы имя, почта и пароль.",
      });
    }

    const signUpPromise = supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    toast.promise(signUpPromise, {
      loading: "Создаем ваш профиль...",
      success: (result) => {
        if (result.error) throw result.error;

        if (result.data.user) {
          setTimeout(() => {
            router.push(role === "coach" ? "/coach" : "/student");
          }, 1500);
          return `Добро пожаловать, ${fullName}!`;
        } else {
          return "Проверьте почту для подтверждения!";
        }
      },
      error: (err) => `Ошибка: ${err.message}`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <h1 className="text-2xl font-black text-slate-800 mb-2 text-center">
          Присоединяйтесь к VoltFit
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Выберите вашу роль в системе
        </p>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setRole("student")}
            className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
              role === "student"
                ? "border-blue-600 bg-blue-50"
                : "border-slate-100 opacity-60"
            }`}
          >
            <span className="block text-2xl mb-1">🏃‍♂️</span>
            <span
              className={`font-bold ${role === "student" ? "text-blue-600" : "text-slate-600"}`}
            >
              Ученик
            </span>
          </button>

          <button
            onClick={() => setRole("coach")}
            className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
              role === "coach"
                ? "border-blue-600 bg-blue-50"
                : "border-slate-100 opacity-60"
            }`}
          >
            <span className="block text-2xl mb-1">💪</span>
            <span
              className={`font-bold ${role === "coach" ? "text-blue-600" : "text-slate-600"}`}
            >
              Тренер
            </span>
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Ваше имя"
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:border-blue-500 border-2 border-transparent transition-all"
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:border-blue-500 border-2 border-transparent transition-all"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:border-blue-500 border-2 border-transparent transition-all"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleSignUp}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            Создать аккаунт
          </button>
        </div>
      </div>
    </div>
  );
}
