"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getErrorMessage } from "@/lib/utils/error-helper";

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: "coach" | "student";
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      role: "student",
    },
  });

  // Изолированное отслеживание роли для UI кнопок
  const currentRole = useWatch({
    control,
    name: "role",
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    setLoading(true);
    try {
      // Отправляем в Supabase только нужные поля (confirmPassword пропускаем)
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

        // Чистим историю переходов, чтобы нельзя было вернуться назад на форму
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
    /* Добавлено relative для правильного абсолютного позиционирования кнопки назад */
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      {/* Изменено: кнопка вынесена из контейнера формы и прижата к левому верхнему углу экрана */}
      <Link
        href="/login"
        className="absolute top-6 left-6 flex items-center text-slate-400 hover:text-slate-800 transition-colors text-sm font-medium w-fit group"
      >
        <ChevronLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        вход
      </Link>

      <div className="max-w-md w-full p-8 rounded-3xl">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link
            href="/"
            className="w-fit flex items-center justify-center px-4 py-1.5 bg-yellow-400 text-slate-950 font-black text-xl italic tracking-wider rounded-xl hover:bg-yellow-300 transition-colors"
          >
            VOLTFIT
          </Link>
          <p className="text-slate-400 mt-2">Создайте аккаунт за пару минут</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 flex flex-col"
        >
          {/* Выбор роли */}
          <div className="flex gap-4 mb-2">
            {(["student", "coach"] as const).map((roleType) => (
              <button
                key={roleType}
                type="button"
                onClick={() => setValue("role", roleType)}
                className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center ${
                  currentRole === roleType
                    ? "border-slate-800 bg-slate-100"
                    : "border-slate-100 bg-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <span
                  className={`font-bold text-sm ${currentRole === roleType ? "text-slate-950" : "text-slate-500"}`}
                >
                  {roleType === "student" ? "Ученик" : "Тренер"}
                </span>
              </button>
            ))}
          </div>

          {/* Имя */}
          <div className="relative w-full">
            <input
              {...register("fullName", { required: "Введите ваше имя" })}
              type="text"
              placeholder="Как вас зовут?"
              className={`w-full p-4 bg-transparent rounded-t-2xl rounded-b-none outline-none border-b-2 transition-all text-slate-800 ${
                errors.fullName
                  ? "border-b-red-400 focus:border-b-red-400"
                  : "border-b-slate-300 focus:border-b-slate-800"
              }`}
            />
            {errors.fullName && (
              <span className="text-red-500 text-xs ml-2 mt-1 block font-medium">
                {errors.fullName.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="relative w-full">
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
              className={`w-full p-4 bg-transparent rounded-t-2xl rounded-b-none outline-none border-b-2 transition-all text-slate-800 ${
                errors.email
                  ? "border-b-red-400 focus:border-b-red-400"
                  : "border-b-slate-300 focus:border-b-slate-800"
              }`}
            />
            {errors.email && (
              <span className="text-red-500 text-xs ml-2 mt-1 block font-medium">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Пароль */}
          <div className="relative w-full">
            <input
              {...register("password", {
                required: "Придумайте пароль",
                minLength: { value: 6, message: "Минимум 6 символов" },
              })}
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
              className={`w-full p-4 bg-transparent rounded-t-2xl rounded-b-none outline-none border-b-2 transition-all text-slate-800 pr-12 ${
                errors.password
                  ? "border-b-red-400 focus:border-b-red-400"
                  : "border-b-slate-300 focus:border-b-slate-800"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-800 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <span className="text-red-500 text-xs ml-2 mt-1 block font-medium">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Повторите пароль */}
          <div className="relative w-full">
            <input
              {...register("confirmPassword", {
                required: "Повторите пароль",
                validate: (val: string) =>
                  getValues("password") === val || "Пароли не совпадают",
              })}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Повторите пароль"
              className={`w-full p-4 bg-transparent rounded-t-2xl rounded-b-none outline-none border-b-2 transition-all text-slate-800 pr-12 ${
                errors.confirmPassword
                  ? "border-b-red-400 focus:border-b-red-400"
                  : "border-b-slate-300 focus:border-b-slate-800"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-800 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.confirmPassword && (
              <span className="text-red-500 text-xs ml-2 mt-1 block font-medium">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full max-w-[240px] mx-auto py-4 bg-yellow-400 text-slate-950 font-bold rounded-2xl hover:bg-yellow-300 transition-all shadow-md disabled:bg-slate-300 disabled:text-slate-500 mt-4"
          >
            {loading ? "Создаем профиль..." : "ЗАРЕГИСТРИРОВАТЬСЯ"}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500 text-sm">
          Уже есть аккаунт?{" "}
          <Link
            href="/login"
            className="text-slate-800 font-medium underline underline-offset-4 decoration-1 transition-colors hover:text-slate-600"
          >
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
