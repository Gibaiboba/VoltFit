"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import { BASE_QUESTIONS, TARGET_QUESTIONS } from "@/constants/questions";
import GoalStep from "@/components/onboarding/GoalStep";
import ActivityStep from "@/components/onboarding/ActivityStep";
import ProcessingStep from "@/components/onboarding/ProcessingStep";
import { QuestionCard } from "../../components/onboarding/QuestionCard";
import { FramerWrapper } from "@/components/shared/FramerWrapper";

/**
 * Хелпер для динамической сборки линейной карты экранов
 */
function getOnboardingPipeline(goal?: string) {
  const pipeline = [
    ...BASE_QUESTIONS.map((q) => q.id), // 1. Стартовые базовые (gender -> birth_date -> height -> weight)
    "goal", // 2. Выбор главной цели
  ];

  // 3. Динамическая подгрузка вопросов выбранной ветки
  if (goal && TARGET_QUESTIONS[goal]) {
    pipeline.push(...TARGET_QUESTIONS[goal].map((q) => q.id));
  }

  pipeline.push("activity"); // 4.  Уровень активности
  pipeline.push("processing"); // 5. Экран расчетов, анимации стадий и сохранения в базу

  return pipeline;
}

export default function OnboardingPage() {
  const { step, data } = useOnboardingStore();

  // Собираем точную последовательность экранов для текущей сессии
  const pipeline = getOnboardingPipeline(data.goal);
  const totalSteps = pipeline.length;

  // Идентификатор экрана на текущем шаге (индекс в массиве: step - 1)
  const currentStepId = pipeline[step - 1];

  const estimatedTotalSteps = data.goal ? totalSteps : 14;
  const progressPercentage = Math.min((step / estimatedTotalSteps) * 100, 100);

  /**
   *Функция рендера конкретного экрана на основе его строкового ID
   */
  const renderStep = (stepId: string) => {
    if (stepId === "goal") return <GoalStep />;
    if (stepId === "activity") return <ActivityStep />;
    if (stepId === "processing") return <ProcessingStep />;

    // Поиск и рендер вопроса из БАЗОВОГО массива констант
    const baseQuestion = BASE_QUESTIONS.find((q) => q.id === stepId);
    if (baseQuestion) {
      return <QuestionCard key={baseQuestion.id} question={baseQuestion} />;
    }

    // Поиск and рендер вопроса из ДИНАМИЧЕСКИХ веток констант
    if (data.goal && TARGET_QUESTIONS[data.goal]) {
      const targetQuestion = TARGET_QUESTIONS[data.goal].find(
        (q) => q.id === stepId,
      );
      if (targetQuestion) {
        return (
          <QuestionCard key={targetQuestion.id} question={targetQuestion} />
        );
      }
    }

    // Фолбек-предохранитель на случай непредвиденных сдвигов структуры
    return <ProcessingStep />;
  };

  return (
    <div className="w-full flex-1 flex flex-col max-w-md mx-auto p-6 min-h-screen justify-start">
      {/* Динамическая и плавная полоска прогресса */}
      <div className="w-full bg-gray-100 h-1.5 mb-6 rounded-full overflow-hidden shrink-0">
        <div
          className="bg-blue-600 h-full transition-all duration-700 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Обертка экранов с анимацией переключения шагов */}
      <div className="flex-1 flex flex-col justify-start">
        <FramerWrapper activeKey={step}>
          {renderStep(currentStepId)}
        </FramerWrapper>
      </div>
    </div>
  );
}
