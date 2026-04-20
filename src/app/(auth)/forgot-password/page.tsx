"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { authService, getErrorMessage } from "@/services/auth";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface ForgotPasswordValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    defaultValues: { email: "" },
  });

  // Логика таймера для повторной отправки
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSent && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [isSent, secondsLeft]);

  const onSubmit: SubmitHandler<ForgotPasswordValues> = async (values) => {
    setLoading(true);
    try {
      await authService.resetPassword(values.email);
      setIsSent(true);
      setSecondsLeft(60); // Сброс таймера при каждой отправке
      setCanResend(false);
      toast.success("Инструкции отправлены!");
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setIsSent(false);
    setCanResend(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        {/* Навигация назад */}
        <Link
          href="/login"
          className="flex items-center text-slate-400 hover:text-blue-600 transition-colors mb-6 text-sm font-medium w-fit group"
        >
          <ChevronLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Назад к входу
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Восстановление <span className="text-blue-600">пароля</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {isSent
              ? "Мы отправили ссылку для сброса на ваш email. Проверьте входящие и папку Спам."
              : "Введите ваш email, и мы пришлем ссылку для создания нового пароля."}
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register("email", {
                  required: "Введите Email",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Некорректный формат почты",
                  },
                })}
                type="email"
                placeholder="Ваш Email"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-slate-300"
            >
              {loading ? "Отправляем..." : "ОТПРАВИТЬ ССЫЛКУ"}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-700 text-sm leading-relaxed">
              Ссылка действительна 24 часа. Если письма нет, проверьте
              правильность адреса.
            </div>

            <div className="space-y-4">
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-blue-600 font-bold hover:underline text-sm"
                >
                  Не пришло письмо? Отправить снова
                </button>
              ) : (
                <p className="text-slate-400 text-sm">
                  Отправить повторно через{" "}
                  <span className="font-mono font-bold text-slate-600">
                    {secondsLeft}
                  </span>{" "}
                  сек.
                </p>
              )}

              <Link
                href="/login"
                className="block w-full py-4 bg-slate-800 text-white text-center font-bold rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-100"
              >
                ВЕРНУТЬСЯ КО ВХОДУ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
