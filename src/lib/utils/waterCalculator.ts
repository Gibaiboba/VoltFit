import { UserProfile } from "@/types/user";
import { LoggedActivity } from "@/hooks/use-student-dashboard/types";
import {
  calculateBaseWaterTarget,
  getAgeFromBirthDate,
} from "@/lib/fitnessCalculators";
import { ActivityLevel } from "@/types/onboarding";

export function calculateDynamicWaterTarget(
  profile: UserProfile | null,
  steps: number,
  activities: LoggedActivity[],
): number {
  let waterTarget = 2000; // Дефолт на случай полной пустоты профиля

  // 1. Извлекаем БАЗОВУЮ норму из онбординга
  if (profile?.water_target) {
    waterTarget = profile.water_target;
  } else if (profile) {
    //  Если в БД пусто, используем наш единый калькулятор из онбординга
    const calculatedAge = profile.birth_date
      ? getAgeFromBirthDate(profile.birth_date)
      : (profile.age ?? 25);

    const baseWaterLiters = calculateBaseWaterTarget({
      weight: profile.weight ?? 70,
      gender: (profile.gender as "male" | "female") || "female",
      age: calculatedAge,
      activityLevel: (Number(profile.activity_level) || 1.2) as ActivityLevel,
    });
    waterTarget = Math.round(baseWaterLiters * 1000);
  }

  // 2. ДИНАМИЧЕСКИЕ НАДБАВКИ

  // Шаги: Начисляем воду за шаги, которые превышают базовый минимум сидячего человека (~4000 шагов).

  const activeSteps = Math.max(0, steps - 4000);
  if (activeSteps > 0) {
    waterTarget += Math.floor(activeSteps / 1000) * 50; // +50 мл за каждую 1000 активных шагов
  }

  // Тренировки: Динамическое увеличение от добавленной активности
  if (activities && activities.length > 0) {
    const totalDuration = activities.reduce(
      (sum, act) => sum + (act.duration || 0),
      0,
    );
    waterTarget += totalDuration * 11; // ~11 мл за каждую минуту спорта (или ~330 мл за 30 мин)
  }

  // 3. Безопасные лимиты
  const gender = profile?.gender ?? "female";
  const minLimit = gender === "female" ? 1200 : 1500;
  if (waterTarget < minLimit) waterTarget = minLimit;
  if (waterTarget > 5000) waterTarget = 5000;

  return Math.round(waterTarget / 50) * 50;
}
