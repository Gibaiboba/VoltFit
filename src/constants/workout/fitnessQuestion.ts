import { FitnessQuestion } from "@/types/workout";

export const FITNESS_QUESTIONS: FitnessQuestion[] = [
  {
    id: "training_place",
    title: "Где вы планируете тренироваться?",
    subtitle: "Подберём упражнения под вашу обстановку",
    type: "single",
    options: [
      { label: "🏡 Дома", value: "home" },
      { label: "🏋️‍♂️ В тренажерном зале", value: "gym" },
      { label: "🌲 На уличной площадке", value: "street" },
      { label: "🔄 Комбинированный вариант", value: "mixed" },
    ],
  },
  {
    id: "equipment",
    title: "Какое оборудование доступно?",
    subtitle: "Можно выбрать несколько вариантов",
    type: "multiple",
    options: [
      {
        label: "🤸 Только вес собственного тела / коврик",
        value: "bodyweight",
      },
      { label: "🎗️ Фитнес-резинки / эспандеры", value: "bands" },
      { label: "💪 Гантели или гири", value: "dumbbells" },
      { label: "bars Турник и брусья", value: "pullup_bar" },
      { label: "🏋️ Полный набор зала (штанги, тренажеры)", value: "full_gym" },
    ],
  },
  {
    id: "fitness_experience",
    title: "Ваш опыт и владение техникой",
    type: "single",
    options: [
      {
        label: "🥚 Новичок (ставим базовую технику с нуля)",
        value: "beginner",
      },
      {
        label: "🏃 Средний (знаю базу, тренировался ранее)",
        value: "intermediate",
      },
      {
        label: "⚡ Продвинутый (регулярный стаж 6+ месяцев)",
        value: "advanced",
      },
    ],
  },
  {
    id: "schedule_duration",
    title: "Сколько минут готовы уделять тренировке?",
    subtitle: "С учетом разминки и заминки",
    type: "single",
    options: [
      { label: "⏱️ 30 минут (интенсивно и компактно)", value: "30" },
      { label: "⏱️ 45 минут (оптимальный баланс)", value: "45" },
      { label: "⏱️ 60+ минут (полноценная проработка)", value: "60" },
    ],
  },
  {
    id: "focus_zones",
    title: "Над какими зонами хотите поработать больше?",
    subtitle: "Выберите 1–3 приоритетных акцента",
    type: "multiple",
    options: [
      { label: "🔥 Всё тело равномерно (Fullbody)", value: "fullbody" },
      { label: "🍑 Ягодицы и ноги", value: "legs" },
      { label: "🦅 Спина и красивая осанка", value: "back" },
      { label: "💪 Руки, плечи и грудь", value: "upper" },
      { label: "🍫 Пресс и мышцы кора", value: "core" },
    ],
  },
  {
    id: "health_restrictions",
    title: "Есть ли ограничения по здоровью?",
    subtitle: "Исключим травмоопасные движения и осевые нагрузки",
    type: "multiple",
    options: [
      { label: "✅ Противопоказаний нет, всё отлично", value: "none" },
      {
        label: "🦴 Спина / поясница (грыжи, протрузии, остеохондроз)",
        value: "back",
      },
      { label: "🦵 Колени или суставы", value: "knees" },
      { label: "❤️ Давление, сердце, одышка или варикоз", value: "heart" },
      {
        label: "🩺 Недавние травмы, операции или запрет врача",
        value: "injuries",
      },
    ],
  },
  {
    id: "female_health",
    title: "Особенности женского здоровья",
    subtitle: "Для бережной адаптации нагрузки и восстановления",
    type: "multiple",
    femaleOnly: true, // Автоматически скроется для мужчин
    options: [
      { label: "🌸 Особых ограничений нет", value: "none" },
      {
        label: "🌊 Учитывать фазы цикла (сильные боли / отёчность)",
        value: "cycle_sensitive",
      },
      {
        label: "👶 Роды менее 12 мес. назад / диастаз / тазовое дно",
        value: "postpartum",
      },
    ],
  },
  {
    id: "coach_notes",
    title: "Пожелания для тренера и программы",
    subtitle: "Необязательный шаг — можно пропустить",
    type: "text",
    placeholder:
      "Например: не люблю берпи и бег, был вывих плеча 2 года назад, хочу подтянуть форму за 3 месяца...",
  },
];
