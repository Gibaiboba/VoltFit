"use client";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import GoalStep from "@/components/onboarding/GoalStep";
import MetricsStep from "@/components/onboarding/MetricsStep";
import ActivityStep from "@/components/onboarding/ActivityStep";
import ProcessingStep from "@/components/onboarding/ProcessingStep";
import { FramerWrapper } from "@/components/shared/FramerWrapper";

export default function OnboardingPage() {
  const step = useOnboardingStore((state) => state.step);

  return (
    <main className="max-w-md mx-auto min-h-screen flex flex-col p-6">
      {/* Индикатор прогресса */}
      <div className="w-full bg-gray-200 h-2 mb-8 rounded-full">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Контент шага с анимацией появления */}
      <FramerWrapper activeKey={step}>{renderStep(step)}</FramerWrapper>
    </main>
  );
}

function renderStep(step: number) {
  switch (step) {
    case 1:
      return <GoalStep />;
    case 2:
      return <MetricsStep />;
    case 3:
      return <ActivityStep />;
    case 4:
      return <ProcessingStep />;
    default:
      return <GoalStep />;
  }
}
