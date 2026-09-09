"use client";

import { useCoachOnboardingStore } from "@/store/useCoachOnboardingStore";
import { COACH_QUESTIONS } from "@/constants/coachQuestions";
import { CoachQuestionCard } from "@/components/onboarding/CoachQuestionCard";
import CoachProcessingStep from "@/components/onboarding/CoachProcessingStep";
import { FramerWrapper } from "@/components/shared/FramerWrapper";

export default function CoachOnboardingPage() {
  const { step } = useCoachOnboardingStore();

  const totalSteps = COACH_QUESTIONS.length + 1;
  const progressPercentage = Math.min((step / totalSteps) * 100, 100);

  const renderStep = (currentStep: number) => {
    const questionData = COACH_QUESTIONS[currentStep - 1];

    if (questionData) {
      return (
        <CoachQuestionCard key={questionData.id} question={questionData} />
      );
    }

    return <CoachProcessingStep />;
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
