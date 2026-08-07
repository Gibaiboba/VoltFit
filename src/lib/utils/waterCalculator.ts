import { UserProfile } from "@/types/user";
import { LoggedActivity } from "@/hooks/use-student-dashboard/types";

export function calculateDynamicWaterTarget(
  profile: UserProfile | null,
  steps: number,
  activities: LoggedActivity[],
): number {
  const weight = profile?.weight ?? 70;
  const gender = profile?.gender ?? "female";
  const age = profile?.age ?? 30;

  // 1. Базовая норма по весу
  const baseCoefficient = gender === "female" ? 30 : 35;
  let waterTarget = weight * baseCoefficient;

  // 2. Учет базового образа жизни из PROFILE (activity_level)
  const palValue = Number(profile?.activity_level) || 1.2;
  if (palValue >= 1.725) {
    waterTarget += 500;
  } else if (palValue >= 1.55) {
    waterTarget += 350;
  } else if (palValue >= 1.375) {
    waterTarget += 150;
  }

  // 3. Коррекция по возрасту
  if (age > 55) waterTarget *= 0.9;
  if (age < 18) waterTarget *= 1.1;

  // 4. Динамическая надбавка за шаги дня (+50 мл за каждые 1000 шагов)
  if (steps > 0) {
    waterTarget += Math.floor(steps / 1000) * 50;
  }

  // 5. Динамическая надбавка за текущие тренировки из массива activities
  if (activities && activities.length > 0) {
    const totalDuration = activities.reduce(
      (sum, act) => sum + (act.duration || 0),
      0,
    );
    waterTarget += totalDuration * 11; // ~11 мл за минуту спорта
  }

  // Безопасные лимиты
  const minLimit = gender === "female" ? 1200 : 1500;
  if (waterTarget < minLimit) waterTarget = minLimit;
  if (waterTarget > 4500) waterTarget = 4500;

  return Math.round(waterTarget / 50) * 50;
}
