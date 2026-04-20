"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { authService, getErrorMessage } from "@/services/auth";
import { Eye, EyeOff, Lock } from "lucide-react";

interface UpdatePasswordValues {
  password: string;
  confirmPassword: string;
}

export default function UpdatePasswordPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdatePasswordValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit: SubmitHandler<UpdatePasswordValues> = async (values) => {
    setLoading(true);
    try {
      const data = await authService.updatePassword(values.password);

      // Проверка на наличие пользователя
      if (!data?.user) {
        throw new Error("Не удалось обновить пароль. Попробуйте еще раз.");
      }

      toast.success("Пароль успешно изменен!", {
        description: "Теперь вы можете войти с новым паролем.",
      });

      // Используем replace, чтобы юзер не мог вернуться назад на страницу смены пароля
      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error: unknown) {
      console.error("Update password error:", error);

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
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Новый <span className="text-blue-600">пароль</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Придумайте сложный пароль для вашей безопасности
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Основной пароль */}
          <div className="relative">
            <input
              {...register("password", {
                required: "Введите новый пароль",
                minLength: { value: 6, message: "Минимум 6 символов" },
              })}
              type={showPassword ? "text" : "password"}
              placeholder="Новый пароль"
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

          {/* Подтверждение пароля */}
          <div>
            <input
              {...register("confirmPassword", {
                required: "Повторите пароль",
                validate: (value) =>
                  value === password || "Пароли не совпадают",
              })}
              type="password"
              placeholder="Повторите пароль"
              className={`w-full p-4 bg-slate-50 rounded-2xl border-2 transition-all outline-none text-slate-800 ${
                errors.confirmPassword
                  ? "border-red-400"
                  : "border-transparent focus:border-blue-500"
              }`}
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-xs ml-2 mt-1 block font-medium">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-slate-300"
          >
            {loading ? "Обновление..." : "СОХРАНИТЬ ПАРОЛЬ"}
          </button>
        </form>
      </div>
    </div>
  );
}
