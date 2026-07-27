"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { getErrorMessage } from "@/lib/utils/error-helper";

interface UpdatePasswordValues {
  password: string;
  confirmPassword: string;
}

export default function UpdatePasswordPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Добавлено состояние для второго глазика
  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<UpdatePasswordValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<UpdatePasswordValues> = async (values) => {
    setLoading(true);
    try {
      const data = await authService.updatePassword(values.password);

      if (!data?.user) {
        throw new Error("Не удалось обновить пароль. Попробуйте еще раз.");
      }

      toast.success("Пароль успешно изменен!", {
        description: "Теперь вы можете войти с новым паролем.",
      });

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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-3xl">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link
            href="/"
            className="w-fit flex items-center justify-center px-4 py-1.5 bg-yellow-400 text-slate-950 font-black text-xl italic tracking-wider rounded-xl hover:bg-yellow-300 transition-colors mb-6"
          >
            VOLTFIT
          </Link>

          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="text-slate-800" size={32} />
          </div>

          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Новый пароль
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Придумайте сложный пароль для вашей безопасности
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 flex flex-col"
        >
          {/* Основной пароль */}
          <div className="relative w-full">
            <input
              {...register("password", {
                required: "Введите новый пароль",
                minLength: { value: 6, message: "Минимум 6 символов" },
              })}
              type={showPassword ? "text" : "password"}
              placeholder="Новый пароль"
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

          {/* Подтверждение пароля */}
          <div className="relative w-full">
            {/* Изменено: тип меняется в зависимости от showConfirmPassword, добавлен pr-12 */}
            <input
              {...register("confirmPassword", {
                required: "Повторите пароль",
                validate: (value) =>
                  value === getValues("password") || "Пароли не совпадают",
              })}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Повторите пароль"
              className={`w-full p-4 bg-transparent rounded-t-2xl rounded-b-none outline-none border-b-2 transition-all text-slate-800 pr-12 ${
                errors.confirmPassword
                  ? "border-b-red-400 focus:border-b-red-400"
                  : "border-b-slate-300 focus:border-b-slate-800"
              }`}
            />
            {/* Добавлено: Кнопка-глазик для второго поля */}
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
            {loading ? "Обновление..." : "СОХРАНИТЬ ПАРОЛЬ"}
          </button>
        </form>
      </div>
    </div>
  );
}
