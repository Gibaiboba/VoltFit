"use client";

import { useCoachOnboardingStore } from "@/store/useCoachOnboardingStore";
import { COACH_QUESTIONS } from "@/constants/coachQuestions";
import { QuestionCard } from "@/components/onboarding/QuestionCard";
import CoachProcessingStep from "@/components/onboarding/CoachProcessingStep";
import { FramerWrapper } from "@/components/shared/FramerWrapper";

export default function CoachOnboardingPage() {
  const { step } = useCoachOnboardingStore();

  // Общее количество шагов: вопросы + 1 финальный шаг обработки данных
  const totalSteps = COACH_QUESTIONS.length + 1;
  const progressPercentage = Math.min((step / totalSteps) * 100, 100);

  const renderStep = (currentStep: number) => {
    // Индекс в массиве: currentStep - 1
    const questionData = COACH_QUESTIONS[currentStep - 1];

    if (questionData) {
      return (
        // Переиспользуем универсальную карточку, указывая флаг роли тренера
        <QuestionCard
          key={questionData.id}
          question={questionData}
          isCoach={true}
        />
      );
    }

    // Если вопросы кончились, рендерим финальную загрузку тренера
    return <CoachProcessingStep />;
  };

  return (
    <main className="max-w-md mx-auto min-h-screen flex flex-col p-6 justify-start">
      <div className="w-full bg-gray-100 h-2 mb-8 rounded-full overflow-hidden shrink-0">
        <div
          className="bg-blue-600 h-full transition-all duration-700 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Обертка шагов с анимацией смены экранов */}
      <div className="flex-1 flex flex-col justify-start">
        <FramerWrapper activeKey={step}>{renderStep(step)}</FramerWrapper>
      </div>
    </main>
  );
}
