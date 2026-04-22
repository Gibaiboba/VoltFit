"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { authService, getErrorMessage } from "@/services/auth";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface RegisterFormValues {
  email: string;
  password: string;
  fullName: string;
  role: "coach" | "student";
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: "student",
    },
  });

  const currentRole = watch("role");

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    setLoading(true);
    try {
      const data = await authService.signUp(
        values.email,
        values.password,
        values.fullName,
        values.role,
      );

      if (data.user) {
        toast.success("Регистрация успешна!", {
          description: "Добро пожаловать в VoltFit!",
        });

        // Используем replace для чистой истории
        router.replace(values.role === "coach" ? "/coach" : "/student");
      }
    } catch (error: unknown) {
      console.error("Register error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <Link
          href="/login"
          className="flex items-center text-slate-400 hover:text-blue-600 transition-colors mb-6 text-sm font-medium w-fit group"
        >
          <ChevronLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Назад ко входу
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Volt<span className="text-blue-600">Fit</span>
          </h1>
          <p className="text-slate-400 mt-2">Создайте аккаунт за пару минут</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Выбор роли */}
          <div className="flex gap-4 mb-6">
            {(["student", "coach"] as const).map((roleType) => (
              <button
                key={roleType}
                type="button"
                onClick={() => setValue("role", roleType)}
                className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center ${
                  currentRole === roleType
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-50 bg-slate-50 opacity-60 hover:opacity-100"
                }`}
              >
                <span className="text-2xl mb-1">
                  {roleType === "student" ? "🏃‍♂️" : "💪"}
                </span>
                <span
                  className={`font-bold text-sm ${currentRole === roleType ? "text-blue-600" : "text-slate-600"}`}
                >
                  {roleType === "student" ? "Ученик" : "Тренер"}
                </span>
              </button>
            ))}
          </div>

          {/* Имя */}
          <div>
            <input
              {...register("fullName", { required: "Введите ваше имя" })}
              type="text"
              placeholder="Как вас зовут?"
              className={`w-full p-4 bg-slate-50 rounded-2xl border-2 transition-all outline-none text-slate-800 ${
                errors.fullName
                  ? "border-red-400"
                  : "border-transparent focus:border-blue-500"
              }`}
            />
            {errors.fullName && (
              <span className="text-red-500 text-xs ml-2 mt-1 block font-medium">
                {errors.fullName.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              {...register("email", {
                required: "Введите Email",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Некорректный Email",
                },
              })}
              type="email"
              placeholder="Email"
              className={`w-full p-4 bg-slate-50 rounded-2xl border-2 transition-all outline-none text-slate-800 ${
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

          {/* Пароль */}
          <div className="relative">
            <input
              {...register("password", {
                required: "Придумайте пароль",
                minLength: { value: 6, message: "Минимум 6 символов" },
              })}
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
              className={`w-full p-4 bg-slate-50 rounded-2xl border-2 transition-all outline-none text-slate-800 ${
                errors.password
                  ? "border-red-400"
                  : "border-transparent focus:border-blue-500"
              }`}
            />
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-slate-300"
          >
            {loading ? "Создаем профиль..." : "ЗАРЕГИСТРИРОВАТЬСЯ"}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500 text-sm">
          Уже есть аккаунт?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-bold hover:underline"
          >
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
