import { ExerciseTemplate } from "@/types/workout";

export const EXERCISES_DATABASE: ExerciseTemplate[] = [
  // --- ГРУДЬ (chest) ---
  {
    id: "bench_press",
    title: "Жим штанги лежа",
    met: 6.0,
    category: "chest",
    target_muscle: "Грудь",
    image: "🏋️‍♂️",
  },
  {
    id: "incline_dumbbell_press",
    title: "Жим гантелей на наклонной скамье",
    met: 6.0,
    category: "chest",
    target_muscle: "Грудь",
    image: "💪",
  },
  {
    id: "push_ups",
    title: "Отжимания от пола",
    met: 4.0,
    category: "chest",
    target_muscle: "Грудь/Трицепс",
    image: "🤸‍♂️",
  },
  {
    id: "chest_fly",
    title: "Сведение рук в тренажере (Пек-дек)",
    met: 4.5,
    category: "chest",
    target_muscle: "Грудь",
    image: "🦋",
  },

  // --- СПИНА (back) ---
  {
    id: "pull_ups",
    title: "Подтягивания на турнике",
    met: 4.0,
    category: "back",
    target_muscle: "Спина",
    image: "🧗‍♂️",
  },
  {
    id: "lat_pulldown",
    title: "Тяга верхнего блока к груди",
    met: 4.5,
    category: "back",
    target_muscle: "Спина",
    image: "💪",
  },
  {
    id: "barbell_row",
    title: "Тяга штанги в наклоне",
    met: 6.0,
    category: "back",
    target_muscle: "Спина",
    image: "🏋️‍♂️",
  },
  {
    id: "hyperextension",
    title: "Гиперэкстензия",
    met: 3.5,
    category: "back",
    target_muscle: "Спина",
    image: "🧘‍♂️",
  },

  // --- НОГИ И ЯГОДИЦЫ (legs) ---
  {
    id: "squats",
    title: "Приседания со штангой",
    met: 6.0,
    category: "legs",
    target_muscle: "Ноги",
    image: "🏋️‍♂️",
    video_url: "/videos/exercises/squats.mp4",
  },
  {
    id: "deadlift",
    title: "Становая тяга",
    met: 7.0,
    category: "legs",
    target_muscle: "Ноги/Спина",
    image: "🏋️‍♂️",
  },
  {
    id: "dumbell_lunges",
    title: "Выпады с гантелями",
    met: 5.5,
    category: "legs",
    target_muscle: "Ноги",
    image: "🚶‍♂️",
  },
  {
    id: "leg_press",
    title: "Жим ногами в тренажере",
    met: 5.5,
    category: "legs",
    target_muscle: "Ноги",
    image: "🦵",
    video_url: "/videos/exercises/legspress.mp4",
  },

  // --- ПЛЕЧИ (shoulders) ---
  {
    id: "overhead_press",
    title: "Армейский жим стоя",
    met: 6.0,
    category: "shoulders",
    target_muscle: "Плечи",
    image: "🏋️‍♂️",
  },
  {
    id: "lateral_raises",
    title: "Махи гантелями в стороны",
    met: 4.0,
    category: "shoulders",
    target_muscle: "Плечи",
    image: "👐",
    video_url: "/videos/exercises/dumbellraises.mp4",
  },

  // --- РУКИ (arms) ---
  {
    id: "bicep_curls",
    title: "Подъем штанги на бицепс",
    met: 4.0,
    category: "arms",
    target_muscle: "Руки",
    image: "💪",
  },
  {
    id: "tricep_dips",
    title: "Отжимания на брусьях",
    met: 4.5,
    category: "arms",
    target_muscle: "Руки",
    image: "🤸‍♂️",
  },
  {
    id: "tricep_extension",
    title: "Разгибание рук на верхнем блоке",
    met: 3.5,
    category: "arms",
    target_muscle: "Руки",
    image: "💪",
  },

  // --- КОР И ПРЕСС (abs) ---
  {
    id: "crunches",
    title: "Скручивания на пресс",
    met: 3.8,
    category: "abs",
    target_muscle: "Пресс",
    image: "🍫",
  },
  {
    id: "plank",
    title: "Планка (классическая)",
    met: 3.0,
    category: "abs",
    target_muscle: "Пресс",
    image: "🧘‍♂️",
  },

  // --- КАРДИО И РАЗМИНКА (cardio) ---
  {
    id: "stretching",
    title: "Мягкая растяжка мышц",
    met: 2.5,
    category: "cardio",
    target_muscle: "Все тело",
    image: "🧘‍♂️",
  },
  {
    id: "treadmill_run",
    title: "Бег на беговой дорожке",
    met: 8.0,
    category: "cardio",
    target_muscle: "Кардио",
    image: "🏃‍♂️",
  },
];
