"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChefHat, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { OnboardingMetadata } from "@/types/user";
import { Goal } from "@/types/onboarding";
import { toast } from "sonner";

// 1. БАЗА ДИНАМИЧЕСКИХ ВНУТРЕННИХ ВОПРОСОВ ПИТАНИЯ
const INTERNAL_DIET_QUESTIONS = {
  lose_weight: [
    {
      id: "diet_type",
      title: "Особые предпочтения в еде",
      description: "Мы исключим нежелательные продукты из вашего меню",
      options: [
        { label: "Ем абсолютно всё", value: "everything" },
        { label: "Вегетарианское меню", value: "vegan" },
        { label: "Без лактозы / Без глютена", value: "restrictions" },
      ],
    },
    {
      id: "cooking_time",
      title: "Сколько времени есть на готовку?",
      description: "Подберем блюда под ваш темп жизни",
      options: [
        { label: "Минимум (до 15 минут, простые сборки)", value: "fast" },
        { label: "До 30-40 минут (люблю готовить дома)", value: "normal" },
      ],
    },
  ],
  gain_muscle: [
    {
      id: "meal_frequency",
      title: "Количество приемов пищи",
      description: "Как вам комфортнее распределить профицит калорий?",
      options: [
        { label: "3 плотных приема пищи в день", value: "3_meals" },
        {
          label: "4-5 приемов (часто, но небольшими порциями)",
          value: "5_meals",
        },
      ],
    },
    {
      id: "cooking_time",
      title: "Время на готовку",
      description: "Сложность и скорость приготовления блюд",
      options: [
        { label: "Быстрые калорийные рецепты (до 20 мин)", value: "fast" },
        {
          label: "Полноценный meal prep (готовка на 2-3 дня сразу)",
          value: "meal_prep",
        },
      ],
    },
  ],
  maintain: [
    {
      id: "secondary_concern",
      title: "Что еще вас беспокоит, кроме утомляемости?",
      description: "Это поможет точнее настроить баланс витаминов",
      options: [
        { label: "Частые вздутия / Тяжесть после еды", value: "digestion" },
        { label: "Сухость кожи / Шелушение", value: "skin" },
        { label: "Ничего из перечисленного, всё в порядке", value: "none" },
      ],
    },
  ],
};

// 2. МАТРИЦА РЕЦЕПТОВ
const MOCK_RECIPES_DATABASE = [
  {
    id: 1,
    title: "Киноа-боул с авокадо и яйцом пашот",
    category: "Завтрак",
    time: "15 мин",
    calories: 420,
    goals: ["lose_weight", "maintain"],
    dietTypes: ["everything", "vegan", "restrictions"],
    benefits: "Стабилизирует сахар, защищает от упадка сил после обеда.",
    badges: ["Низкий ГИ", "Полезные жиры"],
    image: "🥑",
  },
  {
    id: 2,
    title: "Теплый салат со шпинатом и тунцом",
    category: "Обед",
    time: "10 мин",
    calories: 360,
    goals: ["lose_weight", "maintain"],
    dietTypes: ["everything", "restrictions"],
    benefits:
      "Высокое содержание железа и B12 — устраняет утреннюю разбитость.",
    badges: ["Железо (Fe)", "Омега-3"],
    image: "🥗",
  },
  {
    id: 3,
    title: "Высокобелковый смузи с бананом и арахисовой пастой",
    category: "Перекус",
    time: "5 мин",
    calories: 580,
    goals: ["gain_muscle"],
    dietTypes: ["everything", "vegan"],
    benefits:
      "Жидкие калории. Идеально, если вам тяжело съедать большие порции.",
    badges: ["Плотный профицит", "Легкое усвоение"],
    image: "🥤",
  },
  {
    id: 4,
    title: "Стейк из индейки с запеченной брокколи",
    category: "Ужин",
    time: "25 мин",
    calories: 490,
    goals: ["lose_weight", "gain_muscle", "maintain"],
    dietTypes: ["everything", "restrictions"],
    benefits:
      "Сытный ужин. Включает магний — блокирует ночную тягу к сладкому и перекусам.",
    badges: ["Магний (Mg)", "Максимум белка"],
    image: "🥩",
  },
];

export default function RecipesPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile();

  // Локальный стейт нужен ТОЛЬКО для индекса текущего вопроса и временных ответов в процессе кликов
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("Все");
  const [tempAnswers, setTempAnswers] = useState<Record<string, string>>({});

  // Флаг принудительного сброса (чтобы перерендерить опрос)
  const [isResetting, setIsResetting] = useState(false);

  // Извлекаем иммутабельные метаданные
  const onboardingMetadata = useMemo<Partial<OnboardingMetadata>>(() => {
    return profile?.onboarding_metadata || {};
  }, [profile]);

  // ВЫЧИСЛЯЕМ ФЛАГ ЗАВЕРШЕНИЯ НА ЛЕТУ БЕЗ USEEFFECT
  const dietOnboardingCompleted = useMemo(() => {
    if (isResetting) return false;
    return !!onboardingMetadata.diet_onboarding_completed;
  }, [onboardingMetadata.diet_onboarding_completed, isResetting]);

  // ВЫЧИСЛЯЕМ АКТУАЛЬНЫЕ ОТВЕТЫ СИНХРОННО ИЗ БАЗЫ ИЛИ ЛОКАЛЬНЫХ КЛИКОВ
  const localAnswers = useMemo(() => {
    if (isResetting) return tempAnswers;
    return onboardingMetadata.diet_onboarding_completed
      ? onboardingMetadata.diet_answers || {}
      : tempAnswers;
  }, [
    onboardingMetadata.diet_onboarding_completed,
    onboardingMetadata.diet_answers,
    tempAnswers,
    isResetting,
  ]);

  const userGlobalGoal = (profile?.goal || "maintain") as Goal;
  const activeQuestions = INTERNAL_DIET_QUESTIONS[userGlobalGoal] || [];

  // Мутация безопасного обновления метаданных через TanStack Query
  const { mutate: updateDietMetadata } = useMutation({
    mutationFn: async (newMetadata: OnboardingMetadata) => {
      if (!profile?.id) return;
      const { data, error } = await supabase
        .from("profiles")
        .update({ onboarding_metadata: newMetadata })
        .eq("id", profile.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setIsResetting(false);
      setTempAnswers({});
      setCurrentQuestionIndex(0);
      queryClient.invalidateQueries({
        queryKey: ["user-profile", profile?.id],
      });
    },
    onError: () => {
      setIsResetting(false);
      toast.error("Не удалось сохранить кулинарные настройки");
    },
  });

  const handleSelectOption = (questionId: string, value: string) => {
    const updatedAnswers = { ...localAnswers, [questionId]: value };
    setTempAnswers(updatedAnswers);

    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex((p) => p + 1);
    } else {
      const newMetadata = {
        ...onboardingMetadata,
        diet_onboarding_completed: true,
        diet_answers: updatedAnswers,
      };
      updateDietMetadata(newMetadata);
    }
  };

  const filteredRecipes = useMemo(() => {
    return MOCK_RECIPES_DATABASE.filter((recipe) => {
      if (selectedCategory !== "Все" && recipe.category !== selectedCategory)
        return false;
      if (!recipe.goals.includes(userGlobalGoal)) return false;

      const currentDietType = localAnswers.diet_type;
      if (currentDietType && currentDietType !== "everything") {
        if (!recipe.dietTypes.includes(currentDietType)) return false;
      }
      return true;
    });
  }, [selectedCategory, userGlobalGoal, localAnswers.diet_type]);

  const contextTip = useMemo(() => {
    if (
      userGlobalGoal === "lose_weight" &&
      onboardingMetadata.main_enemy === "sweets"
    ) {
      return "Так как ваш главный враг — тяга к сладкому, мы добавили в меню ужина продукты с магнием и хромом. Это заблокирует желание съесть десерт на ночь.";
    }
    if (
      userGlobalGoal === "gain_muscle" &&
      onboardingMetadata.appetite === "low"
    ) {
      return "Учитывая, что вам сложно съедать большие порции, мы добавили в меню калорийно-плотные смузи и боулы. Минимум объема — максимум пользы.";
    }
    if (
      userGlobalGoal === "maintain" &&
      onboardingMetadata.energy_level === "tired"
    ) {
      return "Ваше меню усилено железом (Fe) и ферментированными продуктами, чтобы устранить утреннюю утомляемость и запустить высокий уровень энергии.";
    }
    return "Ваше сбалансированное фитнес-меню на сегодня сформировано.";
  }, [
    userGlobalGoal,
    onboardingMetadata.main_enemy,
    onboardingMetadata.appetite,
    onboardingMetadata.energy_level,
  ]);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 min-h-screen pt-24 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">
        Извлекаем фитнес-кэш рациона...
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 min-h-screen pt-24 text-slate-900 bg-slate-50 rounded-[40px]">
      <AnimatePresence mode="wait">
        {/* ================= ЭТАП А: ВНУТРЕННИЙ ОПРОС ПИТАНИЯ ================= */}
        {!dietOnboardingCompleted && activeQuestions.length > 0 ? (
          <motion.div
            key="diet-onboarding"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="max-w-md mx-auto bg-white p-8 rounded-[36px] shadow-sm border border-slate-100 flex flex-col min-h-[420px] justify-between text-left"
          >
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">
                Настройка меню • Шаг {currentQuestionIndex + 1} из{" "}
                {activeQuestions.length}
              </span>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-2 leading-tight">
                {activeQuestions[currentQuestionIndex].title}
              </h2>
              {activeQuestions[currentQuestionIndex].description && (
                <p className="text-xs font-medium text-slate-400 mt-1">
                  {activeQuestions[currentQuestionIndex].description}
                </p>
              )}
            </div>

            <div className="space-y-3 my-6">
              {activeQuestions[currentQuestionIndex].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    handleSelectOption(
                      activeQuestions[currentQuestionIndex].id,
                      String(opt.value),
                    )
                  }
                  className="w-full p-5 text-left border-2 border-slate-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all font-bold text-slate-700 active:scale-98 bg-white flex justify-between items-center group"
                >
                  <span>{opt.label}</span>
                  <span className="text-slate-300 group-hover:text-emerald-500 transition-colors">
                    <ArrowRight size={16} />
                  </span>
                </button>
              ))}
            </div>

            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{
                  width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%`,
                }}
              />
            </div>
          </motion.div>
        ) : (
          /* ================= ЭТАП Б: АДАПТИРОВАННОЕ ДНЕВНОЕ МЕНЮ ================= */
          <motion.div
            key="recipes-dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5 text-left">
              <div>
                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                  <ChefHat className="text-emerald-500" size={32} /> Меню дня
                  под контекст
                </h1>
                <p className="text-sm font-medium text-slate-400 mt-1">
                  План питания оптимизирован под цель:{" "}
                  <span className="text-emerald-600 font-extrabold uppercase">
                    {userGlobalGoal === "lose_weight"
                      ? "Похудение"
                      : userGlobalGoal === "gain_muscle"
                        ? "Набор массы"
                        : "ЗОЖ"}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 bg-slate-200/50 p-1.5 rounded-2xl shrink-0 self-start md:self-center">
                {["Все", "Завтрак", "Обед", "Ужин", "Перекус"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      selectedCategory === cat
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 🔥 УМНЫЙ ВИДЖЕТ-ПОДСКАЗКА СИНХРОНИЗИРОВАННЫЙ С КЭШЕМ ОНБОРДИНГА */}
            <div className="flex gap-4 p-5 rounded-[28px] bg-blue-500/5 border border-blue-500/10 items-start text-left">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0">
                <Sparkles size={18} />
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] font-black uppercase text-blue-500 tracking-wider">
                  Анализ вашей анкеты
                </div>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  {contextTip}
                </p>
              </div>
            </div>

            {/* СЕТКА РЕЦЕПТОВ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white p-6 rounded-[32px] border border-slate-100 flex flex-col justify-between text-left hover:shadow-xl transition-all relative overflow-hidden group min-h-[220px]"
                >
                  <div className="absolute right-4 top-4 text-4xl p-2 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                    {recipe.image}
                  </div>

                  <div className="space-y-2 max-w-[75%]">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-md">
                      {recipe.category}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 leading-tight pt-1">
                      {recipe.title}
                    </h3>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {recipe.badges.map((b) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 text-[9px] font-extrabold rounded-full"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2">
                    <span className="text-xs mt-0.5">✨</span>
                    <p className="text-[10px] font-bold text-slate-500 leading-normal">
                      {recipe.benefits}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock size={14} /> {recipe.time}
                      </div>
                      <span>•</span>
                      <div className="text-slate-600 font-extrabold">
                        {recipe.calories} ккал
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-12 text-sm font-bold text-slate-400">
                Нет подходящих рецептов для выбранных фильтров.
              </div>
            )}

            <button
              onClick={() => {
                setIsResetting(true);
                const newMetadata = {
                  ...onboardingMetadata,
                  diet_onboarding_completed: false,
                  diet_answers: {},
                };
                updateDietMetadata(newMetadata);
              }}
              className="inline-flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors mt-4"
            >
              <RotateCcw size={12} /> Перенастроить фильтры питания
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
