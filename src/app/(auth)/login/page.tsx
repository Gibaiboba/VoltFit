"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Неверный логин или пользователь не зарегистрирован!");
      setLoading(false);
      return;
    }

    if (data?.user) {
      const role = data.user.user_metadata?.role;

      if (role === "coach") {
        router.push("/coach");
      } else {
        router.push("/student");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Volt<span className="text-blue-600">Fit</span>
          </h1>
          <p className="text-slate-400 mt-2">
            С возвращением! Войдите в аккаунт
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:border-blue-500 border-2 border-transparent transition-all text-slate-800"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            required
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:border-blue-500 border-2 border-transparent transition-all text-slate-800"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-slate-300"
          >
            {loading ? "Входим..." : "ВОЙТИ"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Нет аккаунта?
            <button
              onClick={() => router.push("/register")}
              className="text-blue-600 font-bold hover:underline"
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
