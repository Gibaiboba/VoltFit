import { EXERCISES_DATABASE } from "@/constants/workout/exerciseData";
import {
  FitnessProfile,
  WorkoutTemplate,
  WorkoutExercise,
  HealthRestriction,
  ExerciseLocation,
  ExerciseEquipment,
} from "@/types/workout";

export function generatePresetWorkouts(
  fitnessProfile: FitnessProfile,
  userGlobalGoal: string = "maintain",
  energyLevel?: string,
): WorkoutTemplate[] {
  const answers = fitnessProfile?.answers || {};
  const place = (answers.training_place as string) || "home";
  const userEquipment = (answers.equipment as ExerciseEquipment[]) || [
    "bodyweight",
  ];
  const experience = (answers.fitness_experience as string) || "beginner";
  const duration = Number(answers.schedule_duration) || 45;
  const focusZones = (answers.focus_zones as string[]) || ["fullbody"];
  const healthIssues =
    (answers.health_restrictions as HealthRestriction[]) || [];
  const femaleHealth = (answers.female_health as string[]) || [];

  // Собираем все ограничения здоровья в единый список
  const allRestrictions: HealthRestriction[] = healthIssues.filter(
    (h) => h !== ("none" as HealthRestriction),
  );
  if (femaleHealth.includes("postpartum")) {
    allRestrictions.push("postpartum", "back");
  }

  // 1. Фильтруем базу упражнений под локацию, инвентарь и здоровье
  const safeExercises = EXERCISES_DATABASE.filter((ex) => {
    // Проверка здоровья (если есть противопоказание — строго исключаем)
    if (
      ex.contraindications &&
      ex.contraindications.some((c) => allRestrictions.includes(c))
    ) {
      return false;
    }

    // Проверка локации (если не "mixed")
    if (
      place !== "mixed" &&
      ex.locations &&
      !ex.locations.includes(place as ExerciseLocation)
    ) {
      return false;
    }

    // Проверка инвентаря (если зал — доступно всё, иначе проверяем пересечение)
    if (place !== "gym" && ex.equipment) {
      const hasRequiredEq = ex.equipment.some(
        (eq) => eq === "bodyweight" || userEquipment.includes(eq),
      );
      if (!hasRequiredEq) return false;
    }

    return true;
  });

  // Fallback: если фильтры оказались слишком строгими, берем базовые упражнения со своим весом
  const pool =
    safeExercises.length >= 3
      ? safeExercises
      : EXERCISES_DATABASE.filter(
          (ex) => !ex.equipment || ex.equipment.includes("bodyweight"),
        );

  // 2. Определяем параметры подходов, повторов и отдыха под ЦЕЛЬ и ОПЫТ
  const setsCount = experience === "beginner" ? 3 : 4;
  let targetReps = "12";
  let restSeconds = 75;

  if (userGlobalGoal === "lose_weight") {
    targetReps = "15";
    restSeconds = 45;
  } else if (userGlobalGoal === "gain_muscle") {
    targetReps = "10";
    restSeconds = 90;
  }

  // Учитываем утомляемость или чувствительную фазу цикла
  if (energyLevel === "tired" || femaleHealth.includes("cycle_sensitive")) {
    restSeconds += 15;
  }

  // Сколько упражнений поместится в выбранное время (30 мин -> 4 упр., 45 мин -> 5 упр., 60+ -> 6 упр.)
  const exercisesPerWorkout = duration <= 30 ? 4 : duration <= 45 ? 5 : 6;

  // Хелпер преобразования ExerciseTemplate -> WorkoutExercise
  const mapToWorkoutExercise = (
    ex: (typeof pool)[number],
  ): WorkoutExercise => ({
    id: ex.id,
    title: ex.title,
    met: ex.met,
    video_url: ex.video_url,
    rest_time: restSeconds,
    sets: Array.from({ length: setsCount }, () => ({
      reps: ex.id === "plank" ? "45" : targetReps,
      weight: "0",
      done: false,
    })),
  });

  // 3. Собираем 2 сбалансированных комплекса (День А и День Б)
  const buildWorkout = (
    name: string,
    preferredCategories: string[],
    offset: number = 0,
  ): WorkoutTemplate => {
    const prioritized = [
      ...pool.filter((e) => preferredCategories.includes(e.category)),
      ...pool.filter((e) => !preferredCategories.includes(e.category)),
    ];

    // Берем уникальные упражнения со смещением, чтобы День А и День Б отличались
    const selected = prioritized
      .slice(offset, offset + exercisesPerWorkout)
      .concat(
        prioritized.slice(
          0,
          Math.max(0, offset + exercisesPerWorkout - prioritized.length),
        ),
      )
      .slice(0, exercisesPerWorkout);

    return {
      name,
      exercises: selected.map(mapToWorkoutExercise),
    };
  };

  const dayAPriorities = focusZones.includes("legs")
    ? ["legs", "abs", "cardio"]
    : ["chest", "legs", "abs"];

  const dayBPriorities = focusZones.includes("back")
    ? ["back", "shoulders", "arms"]
    : ["back", "shoulders", "cardio"];

  return [
    buildWorkout(
      userGlobalGoal === "lose_weight"
        ? "День А • Жиросжигающий Fullbody"
        : "День А • Базовый силовой акцент",
      dayAPriorities,
      0,
    ),
    buildWorkout(
      userGlobalGoal === "gain_muscle"
        ? "День Б • Спина, плечи и корпус"
        : "День Б • Тонус и выносливость",
      dayBPriorities,
      2,
    ),
  ];
}
