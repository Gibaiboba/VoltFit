import { Goal, ActivityLevel } from "@/types/onboarding";

/**
 * 1. Автоматический расчет возраста на основе строки даты рождения
 * @param birthDateString Строка формата "YYYY-MM-DD"
 */
export const getAgeFromBirthDate = (birthDateString?: string): number => {
  if (!birthDateString) return 0;
  const birth = new Date(birthDateString);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 ? age : 0;
};

/**
 * 2. Расчет суточной нормы калорий по формуле Миффлина-Сан Жеора
 */

export const calculateDailyCalories = (params: {
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female";
  activityLevel: number;
  goal: Goal;
  bodyType?: string;
  massQuality?: string;
  targetWeight?: number; // Добавили
  targetDate?: string; // Добавили (строка YYYY-MM-DD)
}): {
  calories: number;
  adjustedDate: string | null;
  feedbackMessage: string;
} => {
  const {
    weight,
    height,
    age,
    gender,
    activityLevel,
    goal,
    bodyType,
    massQuality,
    targetWeight,
    targetDate,
  } = params;

  if (!weight || !height || !age || !gender || !activityLevel) {
    return { calories: 0, adjustedDate: null, feedbackMessage: "" };
  }

  // Базовый метаболизм (BMR)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr = gender === "male" ? bmr + 5 : bmr - 161;

  // Расход с учетом активности (TDEE)
  const tdee = Math.round(bmr * activityLevel);

  let totalCalories = tdee;
  let adjustedDate: string | null = null;
  let feedbackMessage = "Базовый план готов.";

  // КЕЙС 1: НАБОР МЫШЦ
  if (goal === "gain_muscle") {
    let surplus = 300;
    if (bodyType === "ectomorph") surplus += 200;
    if (massQuality === "fast") surplus += 200;
    totalCalories = tdee + surplus;
    return {
      calories: totalCalories,
      adjustedDate,
      feedbackMessage: "План набора массы успешно сформирован.",
    };
  }

  // КЕЙС 2: ЗОЖ / ПОДДЕРЖАНИЕ
  if (goal === "maintain") {
    return {
      calories: tdee,
      adjustedDate,
      feedbackMessage: "Сбалансированный план питания готов.",
    };
  }

  // КЕЙС 3: ПОХУДЕНИЕ
  if (goal === "lose_weight") {
    // 3a. Если выбрано похудение к определенной дате
    if (targetWeight && targetDate) {
      const weightDelta = weight - targetWeight;

      if (weightDelta <= 0) {
        return {
          calories: Math.round(tdee * 0.8),
          adjustedDate,
          feedbackMessage: "Целевой вес должен быть меньше текущего.",
        };
      }

      const today = new Date();
      const target = new Date(targetDate);
      const timeDiff = target.getTime() - today.getTime();
      const daysToTarget = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      const validDays = daysToTarget > 2 ? daysToTarget : 7; // Защита от багов с датами

      const totalDeficitRequired = weightDelta * 7700; // 1кг жира = 7700 ккал
      const dailyDeficitRequired = totalDeficitRequired / validDays;

      totalCalories = tdee - dailyDeficitRequired;

      const weeklyLossKg = (dailyDeficitRequired * 7) / 7700;
      const weeklyLossPercentage = (weeklyLossKg / weight) * 100;
      const absoluteMinCalories = gender === "male" ? 1500 : 1200;

      // Проверка безопасности дефицита
      if (totalCalories >= bmr && weeklyLossPercentage <= 1.0) {
        feedbackMessage =
          "Отличная цель! План абсолютно безопасен для здоровья.";
      } else if (
        totalCalories >= absoluteMinCalories &&
        weeklyLossPercentage <= 1.5
      ) {
        feedbackMessage =
          "Интенсивный темп. Потребуется строгое соблюдение режима.";
      } else {
        // Опасно: заставляем худеть по верхней безопасной планке (до BMR)
        totalCalories = bmr;
        const safeDailyDeficit = tdee - bmr;
        const realDaysRequired = Math.ceil(
          totalDeficitRequired / safeDailyDeficit,
        );

        const newTargetDate = new Date();
        newTargetDate.setDate(today.getDate() + realDaysRequired);

        adjustedDate = newTargetDate.toISOString().split("T")[0]; // YYYY-MM-DD
        feedbackMessage = `Выбранный темп опасен. Мы скорректировали дату на ${newTargetDate.toLocaleDateString("ru-RU")}`;
      }
    } else {
      // 3b. Обычное похудение (дефолтный дефицит)
      totalCalories = tdee - 500;
      feedbackMessage = "Комфортный план снижения веса готов.";
    }
  }

  const finalCalories = totalCalories > 0 ? Math.round(totalCalories) : 0;
  return { calories: finalCalories, adjustedDate, feedbackMessage };
};

/**
 * 3. Расчет макронутриентов БЖУ на основе веса и цели
 */
export const calculateMacros = (params: {
  weight: number;
  gender: "male" | "female";
  goal: Goal;
  calories: number;
}) => {
  const { weight, gender, goal, calories } = params;
  if (!weight || calories <= 0) return { protein: 0, fat: 0, carbs: 0 };

  let p_rate = 1.5;
  let f_rate = 1.0;

  if (gender === "male") {
    if (goal === "lose_weight") {
      p_rate = 2.0;
      f_rate = 0.75;
    } else if (goal === "gain_muscle") {
      p_rate = 1.7;
      f_rate = 0.9;
    } else {
      p_rate = 1.6;
      f_rate = 1.0;
    }
  } else {
    if (goal === "lose_weight") {
      p_rate = 1.7;
      f_rate = 0.9;
    } else if (goal === "gain_muscle") {
      p_rate = 1.5;
      f_rate = 1.0;
    } else {
      p_rate = 1.3;
      f_rate = 1.1;
    }
  }

  const protein = Math.round(weight * p_rate);
  const fat = Math.round(weight * f_rate);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { protein, fat, carbs };
};

/**
 * 4. Расчет оптимальной суточной нормы воды в литрах (Старая базовая версия)

 */
export const calculateWaterTarget = (
  weight: number,
  gender: "male" | "female",
): number => {
  if (!weight) return 0;
  const multiplier = gender === "male" ? 35 : 31;
  return parseFloat(((weight * multiplier) / 1000).toFixed(1));
};

/**
 * 5. Расчет БАЗОВОЙ суточной нормы воды в литрах (Для профиля и онбординга)
 *  версия, учитывающая возраст и фоновый уровень активности пользователя.
 */
export const calculateBaseWaterTarget = (params: {
  weight: number;
  gender: "male" | "female";
  age: number;
  activityLevel: number;
}): number => {
  const { weight, gender, age, activityLevel } = params;
  if (!weight) return 0;

  // 1. Базовая норма по весу
  const baseCoefficient = gender === "female" ? 30 : 35;
  let waterTarget = weight * baseCoefficient;

  // 2. Учет базового образа жизни (activity_level)
  if (activityLevel >= 1.725) {
    waterTarget += 500;
  } else if (activityLevel >= 1.55) {
    waterTarget += 350;
  } else if (activityLevel >= 1.375) {
    waterTarget += 150;
  }

  // 3. Коррекция по возрасту
  if (age > 55) waterTarget *= 0.9;
  if (age < 18) waterTarget *= 1.1;

  // Безопасные лимиты
  const minLimit = gender === "female" ? 1200 : 1500;
  if (waterTarget < minLimit) waterTarget = minLimit;
  if (waterTarget > 5000) waterTarget = 5000;

  // Округляем до ближайших 50 мл и переводим в литры (например, 2125мл -> 2150мл -> 2.15л)
  const roundedWaterMl = Math.round(waterTarget / 50) * 50;
  return roundedWaterMl / 1000;
};

/**
 * 6. Расчет БАЗОВОЙ суточной нормы шагов на основе точных коэффициентов активности
 */
export const calculateBaseStepsTarget = (params: {
  goal: Goal;
  activityLevel: ActivityLevel;
}): number => {
  const { goal, activityLevel } = params;
  if (!goal || !activityLevel) return 6000; // Безопасный дефолт

  const stepsMatrix: Record<Goal, Record<ActivityLevel, number>> = {
    lose_weight: {
      1.2: 8000, // Минимальная
      1.375: 10000, // Умеренная
      1.55: 12000, // Активная
      1.725: 14000, // Экстремальная
    },
    gain_muscle: {
      1.2: 5000,
      1.375: 7000,
      1.55: 9000,
      1.725: 11000,
    },
    maintain: {
      1.2: 6000,
      1.375: 8500,
      1.55: 11000,
      1.725: 13000,
    },
  };

  return stepsMatrix[goal]?.[activityLevel] || 7000;
};
