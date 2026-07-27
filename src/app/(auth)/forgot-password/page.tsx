"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getErrorMessage } from "@/lib/utils/error-helper";

interface ForgotPasswordValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const canResend = isSent && secondsLeft === 0;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (!isSent || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSent, secondsLeft]);

  const onSubmit: SubmitHandler<ForgotPasswordValues> = async (values) => {
    setLoading(true);
    try {
      await authService.resetPassword(values.email);
      setIsSent(true);
      setSecondsLeft(60);
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
  };

  return (
    /* Добавлен relative для позиционирования верхней левой кнопки */
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      {/* Изменено: Перемещено в левый верхний угол, синий цвет заменен на slate-800 */}
      <Link
        href="/login"
        className="absolute top-6 left-6 flex items-center text-slate-400 hover:text-slate-800 transition-colors text-sm font-medium w-fit group"
      >
        <ChevronLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Назад к входу
      </Link>

      <div className="max-w-md w-full p-8 rounded-3xl">
        <div className="text-center mb-8 flex flex-col items-center">
          {/* Изменено: Добавлен единый фирменный логотип */}
          <Link
            href="/"
            className="w-fit flex items-center justify-center px-4 py-1.5 bg-yellow-400 text-slate-950 font-black text-xl italic tracking-wider rounded-xl hover:bg-yellow-300 transition-colors mb-4"
          >
            VOLTFIT
          </Link>
          {/* Изменено: Убран синий цвет текста */}
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Восстановление пароля
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-sm">
            {isSent
              ? "Мы отправили ссылку для сброса на ваш email. Проверьте входящие и папку Спам."
              : "Введите ваш email, и мы пришлем ссылку для создания нового пароля."}
          </p>
        </div>

        {!isSent ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 flex flex-col"
          >
            <div className="relative w-full">
              {/* Изменено: Нижнее подчеркивание, убран фон, фокус заменен на slate-800 */}
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

            {/* Изменено: Кнопка сужена и перекрашена в черно-желтый */}
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-[240px] mx-auto py-4 bg-yellow-400 text-slate-950 font-bold rounded-2xl hover:bg-yellow-300 transition-all shadow-md disabled:bg-slate-300 disabled:text-slate-500 mt-4"
            >
              {loading ? "Отправляем..." : "ОТПРАВИТЬ ССЫЛКУ"}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center flex flex-col">
            {/* Изменено: Синяя плашка заменена на минималистичную серую */}
            <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-slate-700 text-sm leading-relaxed text-left">
              Ссылка действительна 24 часа. Если письма нет, проверьте
              правильность адреса.
            </div>

            <div className="space-y-4">
              {canResend ? (
                /* Изменено: Кнопка стала черной, тоньше и всегда подчеркнутой */
                <button
                  onClick={handleResend}
                  className="text-slate-800 font-medium underline underline-offset-4 decoration-1 transition-colors hover:text-slate-600 text-sm"
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

              {/* Изменено: Нижняя кнопка сужена и перекрашена в черно-желтый */}
              <Link
                href="/login"
                className="block w-full max-w-[240px] mx-auto py-4 bg-yellow-400 text-slate-950 text-center font-bold rounded-2xl hover:bg-yellow-300 transition-all shadow-md mt-4"
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
