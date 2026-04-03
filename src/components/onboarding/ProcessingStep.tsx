"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { supabase } from "@/lib/supabase";
import { STAGES } from "@/constants/Stages";
import { toast } from "sonner";

export default function ProcessingStep() {
  const router = useRouter();
  const { data, reset } = useOnboardingStore();
  const [stage, setStage] = useState(0);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const isSaving = useRef(false);
  const isSuccess = useRef(false);

  const currentStages = useMemo(() => {
    return STAGES[data.goal as keyof typeof STAGES] || STAGES.lose_weight;
  }, [data.goal]);

  useEffect(() => {
    if (status !== "loading") return;
    const interval = setInterval(() => {
      setStage((prev) => (prev < currentStages.length - 1 ? prev + 1 : prev));
    }, 700);
    return () => clearInterval(interval);
  }, [currentStages.length, status]);

  useEffect(() => {
    const finalize = async () => {
      if (isSaving.current) return;
      isSaving.current = true;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Пользователь не авторизован");

        // 1. ИЗВЛЕКАЕМ БЖУ ИЗ DATA
        const {
          goal,
          gender,
          age,
          weight,
          height,
          target_weight,
          activityLevel,
          daily_calories,
          protein,
          fat,
          carbs,
          ...metadata
        } = data;

        // отправляем колонки в supabase
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            goal,
            gender,
            age,
            weight,
            height,
            target_weight,
            activity_level: activityLevel,
            daily_calories,
            protein,
            fat,
            carbs,
            onboarding_metadata: metadata,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (profileError) throw profileError;

        await supabase.auth.updateUser({
          data: { onboarding_completed: true },
        });

        isSuccess.current = true;
        setStatus("success");
      } catch (error) {
        console.error("Save error:", error);
        setStatus("error");
        isSaving.current = false;
      }
    };

    finalize();
  }, [data, router]);

  useEffect(() => {
    return () => {
      if (isSuccess.current) reset();
    };
  }, [reset]);

  const handleFinish = () => {
    // 2. Обновляем серверные данные (чтобы Middleware увидел onboarding_completed)
    router.refresh();

    // 3. Определяем цель редиректа
    const target = data.goal === "gain_muscle" ? "/student" : "/student";

    // 4. Совершаем переход
    router.replace(target);
  };

  // Этот эффект сработает, когда пользователь УЖЕ ПЕРЕШЕЛ на другую страницу
  useEffect(() => {
    return () => {
      // Если сохранение прошло успешно, очищаем стор ПРИ УХОДЕ со страницы
      if (isSuccess.current) {
        reset();
      }
    };
  }, [reset]);
  const handleShare = async () => {
    const shareData = {
      title: "Мой фитнес-план",
      text: `Моя норма: ${data.daily_calories} ккал! Б: ${data.protein}г, Ж: ${data.fat}г, У: ${data.carbs}г. Давай со мной!`,
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        toast.success("Данные скопированы в буфер!");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("Не удалось поделиться. Попробуйте позже.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[550px] text-center p-6 bg-white rounded-[40px] shadow-sm overflow-hidden">
      <AnimatePresence mode="wait">
        {status === "loading" ? (
          /* ЭТАП 1: ТОЛЬКО ЛОАДЕР И СТАДИИ  */
          <motion.div
            key="loading-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-12"
          >
            <div className="relative">
              <Loader2 className="w-24 h-24 text-blue-600 animate-spin stroke-[3]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-ping" />
              </div>
            </div>

            <div className="h-20">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={stage}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  className="text-2xl font-black text-gray-900 uppercase tracking-tighter max-w-[280px]"
                >
                  {currentStages[stage]}
                </motion.h3>
              </AnimatePresence>
            </div>
          </motion.div>
        ) : status === "success" ? (
          /* ЭТАП 2: ФИНАЛЬНЫЙ РЕЗУЛЬТАТ (КАРТОЧКИ БЖУ + КНОПКИ) */
          <motion.div
            key="success-state"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm flex flex-col gap-6"
          >
            {/* Иконка и заголовок */}
            <div className="space-y-3">
              <div className="inline-flex p-4 bg-emerald-50 rounded-full">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">
                Твой план готов
              </h2>
            </div>

            {/* Главная карточка Калорий */}
            <div className="bg-slate-900 text-white p-10 rounded-[45px] shadow-2xl shadow-slate-200 relative overflow-hidden text-left">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
                Суточная норма
              </span>
              <div className="text-6xl font-black italic mt-2 tracking-tighter">
                {data.daily_calories}
                <span className="text-xl not-italic ml-2 opacity-50">ккал</span>
              </div>
            </div>

            {/* Сетка БЖУ (Цветные карточки) */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Белки",
                  val: data.protein,
                  color: "bg-orange-50 text-orange-600",
                },
                {
                  label: "Жиры",
                  val: data.fat,
                  color: "bg-rose-50 text-rose-600",
                },
                {
                  label: "Углеводы",
                  val: data.carbs,
                  color: "bg-indigo-50 text-indigo-600",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`${item.color} py-6 rounded-[32px] flex flex-col items-center border border-white shadow-sm`}
                >
                  <span className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-60">
                    {item.label}
                  </span>
                  <div className="text-2xl font-black italic">
                    {item.val}
                    <span className="text-[10px] not-italic ml-0.5 font-bold">
                      г
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={handleFinish}
                className="w-full py-6 bg-blue-600 text-white rounded-[28px] font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-100 active:scale-95 transition-all"
              >
                Всё ясно, поехали! 🚀
              </button>
              <button
                onClick={handleShare}
                className="w-full py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
              >
                Поделиться результатом
              </button>
            </div>
          </motion.div>
        ) : (
          /* ЭТАП ОШИБКИ */
          <motion.div
            key="error-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <AlertCircle className="w-20 h-20 text-rose-500 mx-auto" />
            <h3 className="text-2xl font-black text-gray-900 uppercase">
              Сбой связи...
            </h3>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-gray-100 text-gray-900 rounded-2xl font-black uppercase text-xs hover:bg-gray-200 transition-all"
            >
              Повторить попытку
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
