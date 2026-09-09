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
}): number => {
  const {
    weight,
    height,
    age,
    gender,
    activityLevel,
    goal,
    bodyType,
    massQuality,
  } = params;

  if (!weight || !height || !age || !gender || !activityLevel) return 0;

  // Базовый метаболизм (BMR)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr = gender === "male" ? bmr + 5 : bmr - 161;

  // Умножаем на коэффициент активности
  let total = Math.round(bmr * activityLevel);

  // Корректировка под цель пользователя
  if (goal === "lose_weight") total -= 500;
  if (goal === "gain_muscle") {
    let surplus = 300;
    if (bodyType === "ectomorph") surplus += 200;
    if (massQuality === "fast") surplus += 200;
    total += surplus;
  }

  return total > 0 ? total : 0;
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
