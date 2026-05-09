"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { getErrorMessage } from "@/lib/utils/error-helper";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setLoading(true);
    try {
      const data = await authService.signIn(values.email, values.password);

      if (!data?.user) {
        throw new Error("Не удалось получить данные пользователя.");
      }

      toast.success("Добро пожаловать!");

      // 1. Сначала обновляем роутер, чтобы он "увидел" куки сессии
      router.refresh();

      // 2. Просто делаем редирект на базовый роут.
      // Middleware сам решит: на /onboarding или в кабинет по роли.
      const role = data.user.user_metadata?.role;
      router.replace(role === "coach" ? "/coach" : "/student");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Поле Email */}
          <div className="relative">
            <input
              {...register("email", {
                required: "Введите Email",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Некорректный формат почты",
                },
              })}
              type="email"
              placeholder="Email"
              className={`w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 transition-all text-slate-800 ${
                errors.email
                  ? "border-red-400"
                  : "border-transparent focus:border-blue-500"
              }`}
            />
            {errors.email && (
              <span className="text-red-500 text-xs ml-2 mt-1 block font-medium">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Поле Пароль */}
          <div className="relative">
            <input
              {...register("password", {
                required: "Введите пароль",
                minLength: { value: 6, message: "Минимум 6 символов" },
              })}
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
              className={`w-full p-4 bg-slate-50 rounded-2xl outline-none border-2 transition-all text-slate-800 ${
                errors.password
                  ? "border-red-400"
                  : "border-transparent focus:border-blue-500"
              }`}
            />
            {/* Кнопка "Глазик" */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-slate-400 hover:text-blue-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <span className="text-red-500 text-xs ml-2 mt-1 block font-medium">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Ссылка "Забыли пароль" */}
          <div className="flex justify-end px-2">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors"
            >
              Забыли пароль?
            </Link>
          </div>

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
            Нет аккаунта?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-bold hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
