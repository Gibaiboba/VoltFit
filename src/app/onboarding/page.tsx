"use client";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { QUESTIONS } from "@/constants/questions";
import GoalStep from "@/components/onboarding/GoalStep";
import MetricsStep from "@/components/onboarding/MetricsStep";
import ActivityStep from "@/components/onboarding/ActivityStep";
import ProcessingStep from "@/components/onboarding/ProcessingStep";
import { QuestionCard } from "../../components/onboarding/QuestionCard";
import { FramerWrapper } from "@/components/shared/FramerWrapper";

export default function OnboardingPage() {
  const { step, data } = useOnboardingStore();

  const currentBranch = QUESTIONS[data.goal as keyof typeof QUESTIONS] || [];

  // РАСЧЕТ ПРОГРЕССА:
  // 1 (Цель) + 1 (Метрики) + 1 (Активность) + вопросы ветки + 1 (Финал)
  const questionsCount = data.goal ? currentBranch.length : 8;
  const totalSteps = 1 + 1 + 1 + questionsCount + 1;

  const progressPercentage = Math.min((step / totalSteps) * 100, 100);

  const renderStep = (step: number) => {
    if (step === 1) return <GoalStep />;
    if (step === 2) return <MetricsStep />;
    if (step === 3) return <ActivityStep />;

    // Теперь динамические вопросы начинаются со step 4
    // Чтобы получить первый вопрос из массива (индекс 0), вычитаем 4
    const questionData = currentBranch[step - 4];

    if (!questionData) return <ProcessingStep />;

    return <QuestionCard key={questionData.id} question={questionData} />;
  };

  return (
    <main className="max-w-md mx-auto min-h-screen flex flex-col p-6">
      <div className="w-full bg-gray-100 h-2 mb-8 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-700 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <FramerWrapper activeKey={step}>{renderStep(step)}</FramerWrapper>
    </main>
  );
}
