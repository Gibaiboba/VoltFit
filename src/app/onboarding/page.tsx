"use client";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { QUESTIONS } from "@/constants/questions";
import GoalStep from "@/components/onboarding/GoalStep";
import ActivityStep from "@/components/onboarding/ActivityStep";
import ProcessingStep from "@/components/onboarding/ProcessingStep";
import { QuestionCard } from "../../components/onboarding/QuestionCard";
import { FramerWrapper } from "@/components/shared/FramerWrapper";

export default function OnboardingPage() {
  const { step, data } = useOnboardingStore();

  const currentBranch = QUESTIONS[data.goal as keyof typeof QUESTIONS] || [];

  // РАСЧЕТ ПРОГРЕССА:
  // 1 (Цель) + вопросы ветки + 1 (Активность) + 1 (Финал)
  const questionsCount = data.goal ? currentBranch.length : 8;
  const totalSteps = 1 + questionsCount + 1 + 1;

  const progressPercentage = Math.min((step / totalSteps) * 100, 100);

  const renderStep = (step: number) => {
    // 1. Первый шаг — выбор цели
    if (step === 1) return <GoalStep />;

    // 2. Основные вопросы из QUESTIONS (начинаются со 2-го шага)
    // Индекс в массиве: step - 2
    const questionData = currentBranch[step - 2];

    if (questionData) {
      return <QuestionCard key={questionData.id} question={questionData} />;
    }

    // 3. Когда вопросы в ветке кончились (индекс вышел за пределы массива)
    // Показываем Активность как финальный уточняющий штрих
    const activityStepIndex = 1 + currentBranch.length + 1;
    if (step === activityStepIndex) return <ActivityStep />;

    // 4. Финальный расчет и сохранение в базу
    return <ProcessingStep />;
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
