"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { supabase } from "@/lib/supabase";

const loadingStages = [
  "Анализируем параметры...",
  "Рассчитываем индекс массы тела...",
  "Подбираем дефицит калорий...",
  "Почти готово!",
];

export default function ProcessingStep() {
  const router = useRouter();
  const { data, setStep } = useOnboardingStore();
  const reset = useOnboardingStore((state) => state.reset);
  const [stage, setStage] = useState(0);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  // Флаги для предотвращения повторных запросов и отслеживания успеха
  const isSaving = useRef(false);
  const isSuccess = useRef(false);

  useEffect(() => {
    // Анимация текста
    const interval = setInterval(() => {
      setStage((prev) => (prev < loadingStages.length - 1 ? prev + 1 : prev));
    }, 1000);

    // Валидация данных перед сохранением
    if (!data.goal || !data.weight) {
      setStep(1);
      return () => clearInterval(interval);
    }

    // Основная функция сохранения
    const finalize = async () => {
      if (isSaving.current) return;
      isSaving.current = true;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const [profileRes, authRes] = await Promise.all([
          supabase
            .from("profiles")
            .update({
              goal: data.goal,
              gender: data.gender,
              age: data.age,
              weight: data.weight,
              height: data.height,
              target_weight: data.target_weight,
              activity_level: data.activityLevel,
              vibe_description: data.vibe,
              onboarding_completed: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id),
          supabase.auth.updateUser({
            data: { onboarding_completed: true },
          }),
        ]);

        if (profileRes.error) throw profileRes.error;
        if (authRes.error) throw authRes.error;

        isSuccess.current = true;
        setStatus("success");

        const target =
          user.user_metadata.role === "coach" ? "/coach" : "/student";

        // Только навигация, без сброса данных
        setTimeout(() => {
          router.push(target);
        }, 1500);
      } catch (error) {
        console.error("Save error:", error);
        setStatus("error");
        isSaving.current = false; // разрешаем повторную попытку
      }
    };

    finalize();

    return () => clearInterval(interval);
  }, [data, setStep, router]);

  // Сброс данных только при размонтировании компонента (после успеха)
  useEffect(() => {
    return () => {
      if (isSuccess.current) {
        reset();
      }
    };
  }, [reset]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 text-center px-4">
      {/* Иконка статуса */}
      <div className="h-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </motion.div>
          )}
          {status === "success" && (
            <motion.div
              key="success"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
            >
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </motion.div>
          )}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
            >
              <AlertCircle className="w-16 h-16 text-red-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Текстовый блок */}
      <div className="space-y-4">
        <div className="h-12 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={status === "loading" ? stage : status}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="text-xl font-bold text-gray-800"
            >
              {status === "loading" && loadingStages[stage]}
              {status === "success" && "Ваш план готов!"}
              {status === "error" && "Упс! Что-то пошло не так..."}
            </motion.p>
          </AnimatePresence>
        </div>

        {status === "loading" && data.daily_calories && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-blue-600 font-medium bg-blue-50 px-4 py-1 rounded-full inline-block"
          >
            Цель: {data.daily_calories} ккал/день
          </motion.p>
        )}

        {status === "error" && (
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 font-bold underline"
          >
            Попробовать снова
          </button>
        )}
      </div>
    </div>
  );
}
