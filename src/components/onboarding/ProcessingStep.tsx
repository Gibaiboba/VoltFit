// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
// import { useOnboardingStore } from "@/store/useOnboardingStore";
// import { supabase } from "@/lib/supabase";

// // Динамические тексты под каждую цель
// const STAGES = {
//   lose_weight: [
//     "Анализируем метаболизм...",
//     "Рассчитываем безопасный дефицит...",
//     "Оптимизируем баланс БЖУ...",
//     "План похудения готов!",
//   ],
//   gain_muscle: [
//     "Оцениваем тренировочный потенциал...",
//     "Рассчитываем анаболический профицит...",
//     "Подбираем норму белка...",
//     "План роста мышц готов!",
//   ],
//   maintain: [
//     "Ищем маркеры дефицитов...",
//     "Анализируем уровень энергии...",
//     "Балансируем микронутриенты...",
//     "Ваш ЗОЖ-профиль готов!",
//   ],
// };

// export default function ProcessingStep() {
//   const router = useRouter();
//   const { data, setStep, reset } = useOnboardingStore();
//   const [stage, setStage] = useState(0);
//   const [status, setStatus] = useState<"loading" | "success" | "error">(
//     "loading",
//   );

//   const isSaving = useRef(false);
//   const isSuccess = useRef(false);

//   // Выбираем список стадий на основе цели
//   const currentStages =
//     STAGES[data.goal as keyof typeof STAGES] || STAGES.lose_weight;

//   useEffect(() => {
//     // 1. Анимация прогресса текста
//     const interval = setInterval(() => {
//       setStage((prev) => (prev < currentStages.length - 1 ? prev + 1 : prev));
//     }, 1200);

//     const finalize = async () => {
//       if (isSaving.current) return;
//       isSaving.current = true;

//       try {
//         const {
//           data: { user },
//         } = await supabase.auth.getUser();
//         if (!user) throw new Error("Пользователь не авторизован");

//         // Собираем ВСЕ данные из опросника (включая динамические ветки)
//         // Мы сохраняем их в jsonb колонку 'onboarding_data', чтобы не менять схему таблицы каждый раз
//         const { error: profileError } = await supabase
//           .from("profiles")
//           .update({
//             goal: data.goal,
//             gender: data.gender,
//             age: data.age,
//             weight: data.weight,
//             height: data.height,
//             target_weight: data.target_weight,
//             activity_level: data.activityLevel,
//             daily_calories: data.daily_calories,
//             // Складываем все остальные ответы в метаданные
//             onboarding_metadata: data,
//             onboarding_completed: true,
//             updated_at: new Date().toISOString(),
//           })
//           .eq("id", user.id);

//         if (profileError) throw profileError;

//         // Обновляем метаданные юзера в Auth (для middleware/защиты роутов)
//         await supabase.auth.updateUser({
//           data: { onboarding_completed: true },
//         });

//         isSuccess.current = true;
//         setStatus("success");

//         // Редирект в зависимости от роли
//         const target =
//           user.user_metadata?.role === "coach" ? "/coach" : "/student";

//         setTimeout(() => {
//           router.refresh(); // Обновляет куки и серверные данные (Middleware увидит изменения)
//           router.replace(target); // ЗАМЕНЯЕТ текущую страницу в истории на дашборд
//         }, 2000);
//       } catch (error) {
//         console.error("Save error:", error);
//         setStatus("error");
//         isSaving.current = false;
//       }
//     };

//     finalize();
//     return () => clearInterval(interval);
//   }, [data, setStep, router, currentStages]);

//   // Сброс стора при успешном завершении
//   useEffect(() => {
//     return () => {
//       if (isSuccess.current) reset();
//     };
//   }, [reset]);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-[450px] text-center p-6 bg-white rounded-3xl">
//       <div className="relative mb-10">
//         <AnimatePresence mode="wait">
//           {status === "loading" && (
//             <motion.div
//               key="loader"
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.8, opacity: 0 }}
//               className="relative"
//             >
//               <Loader2 className="w-20 h-20 text-blue-600 animate-spin stroke-[3]" />
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
//               </div>
//             </motion.div>
//           )}
//           {status === "success" && (
//             <motion.div
//               key="success"
//               initial={{ scale: 0.5, rotate: -20 }}
//               animate={{ scale: 1, rotate: 0 }}
//             >
//               <CheckCircle2 className="w-20 h-20 text-emerald-500 stroke-[2]" />
//             </motion.div>
//           )}
//           {status === "error" && (
//             <motion.div
//               key="error"
//               initial={{ scale: 0.5 }}
//               animate={{ scale: 1 }}
//             >
//               <AlertCircle className="w-20 h-20 text-rose-500 stroke-[2]" />
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       <div className="space-y-6 max-w-xs">
//         <div className="h-16">
//           <AnimatePresence mode="wait">
//             <motion.h3
//               key={status === "loading" ? stage : status}
//               initial={{ y: 15, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: -15, opacity: 0 }}
//               className="text-2xl font-black text-gray-900 uppercase tracking-tighter"
//             >
//               {status === "loading" && currentStages[stage]}
//               {status === "success" && "Всё готово!"}
//               {status === "error" && "Сбой связи..."}
//             </motion.h3>
//           </AnimatePresence>
//         </div>

//         {status === "loading" && data.daily_calories && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="flex flex-col gap-1 items-center"
//           >
//             <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
//               Ваша норма:
//             </span>
//             <div className="text-3xl font-black text-blue-600 italic">
//               {data.daily_calories} ккал
//             </div>
//           </motion.div>
//         )}

//         {status === "error" && (
//           <button
//             onClick={() => window.location.reload()}
//             className="px-8 py-4 bg-gray-100 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
//           >
//             Повторить попытку
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { supabase } from "@/lib/supabase";

const STAGES = {
  lose_weight: [
    "Анализируем метаболизм...",
    "Рассчитываем безопасный дефицит...",
    "Оптимизируем баланс БЖУ...",
    "План похудения готов!",
  ],
  gain_muscle: [
    "Оцениваем тренировочный потенциал...",
    "Рассчитываем анаболический профицит...",
    "Подбираем норму белка...",
    "План роста мышц готов!",
  ],
  maintain: [
    "Ищем маркеры дефицитов...",
    "Анализируем уровень энергии...",
    "Балансируем микронутриенты...",
    "Ваш ЗОЖ-профиль готов!",
  ],
};

export default function ProcessingStep() {
  const router = useRouter();
  const { data, reset } = useOnboardingStore();
  const [stage, setStage] = useState(0);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const isSaving = useRef(false);
  const isSuccess = useRef(false);

  const currentStages =
    STAGES[data.goal as keyof typeof STAGES] || STAGES.lose_weight;

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => (prev < currentStages.length - 1 ? prev + 1 : prev));
    }, 1200);

    const finalize = async () => {
      if (isSaving.current) return;
      isSaving.current = true;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Пользователь не авторизован");

        // 1. Извлекаем основные поля, чтобы они НЕ дублировались в JSONB
        const {
          goal,
          gender,
          age,
          weight,
          height,
          target_weight,
          activityLevel,
          daily_calories,
          ...metadata // Все остальные специфические ответы
        } = data;

        // 2. Обновляем профиль с чистым разделением данных
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
            onboarding_metadata: metadata, // Теперь тут нет дублей веса/роста
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (profileError) throw profileError;

        // 3. Обновляем метаданные Auth, чтобы Middleware увидел статус
        await supabase.auth.updateUser({
          data: { onboarding_completed: true },
        });

        isSuccess.current = true;
        setStatus("success");

        const target =
          user.user_metadata?.role === "coach" ? "/coach" : "/student";

        setTimeout(() => {
          router.refresh(); // Принудительно обновляем серверный контекст
          router.replace(target); // Заменяем историю, чтобы нельзя было вернуться "назад"
        }, 2000);
      } catch (error) {
        console.error("Save error:", error);
        setStatus("error");
        isSaving.current = false;
      }
    };

    finalize();
    return () => clearInterval(interval);
  }, [data, router, currentStages]);

  useEffect(() => {
    return () => {
      if (isSuccess.current) reset();
    };
  }, [reset]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] text-center p-6 bg-white rounded-3xl">
      <div className="relative mb-10">
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loader"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative"
            >
              <Loader2 className="w-20 h-20 text-blue-600 animate-spin stroke-[3]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
              </div>
            </motion.div>
          )}
          {status === "success" && (
            <motion.div
              key="success"
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
            >
              <CheckCircle2 className="w-20 h-20 text-emerald-500 stroke-[2]" />
            </motion.div>
          )}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
            >
              <AlertCircle className="w-20 h-20 text-rose-500 stroke-[2]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6 max-w-xs">
        <div className="h-16">
          <AnimatePresence mode="wait">
            <motion.h3
              key={status === "loading" ? stage : status}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              className="text-2xl font-black text-gray-900 uppercase tracking-tighter"
            >
              {status === "loading" && currentStages[stage]}
              {status === "success" && "Всё готово!"}
              {status === "error" && "Сбой связи..."}
            </motion.h3>
          </AnimatePresence>
        </div>

        {status === "loading" && data.daily_calories && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-1 items-center"
          >
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              Ваша норма:
            </span>
            <div className="text-3xl font-black text-blue-600 italic">
              {data.daily_calories} ккал
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gray-100 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
          >
            Повторить попытку
          </button>
        )}
      </div>
    </div>
  );
}
