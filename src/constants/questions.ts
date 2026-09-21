export interface Option {
  label: string;
  value: string | number;
  insight?: string;
}

export interface Question {
  id: string;
  title: string;
  description?: string;
  type?: "input" | "options" | "date" | "deadline_selector";
  unit?: string;
  options?: Option[];
}

// 1. БАЗОВЫЕ ВОПРОСЫ (Показываются абсолютно всем в самом начале, строго по очереди)
export const BASE_QUESTIONS: Question[] = [
  {
    id: "gender",
    title: "Ваш пол",
    options: [
      { label: "Мужчина", value: "male" },
      { label: "Женщина", value: "female" },
    ],
  },
  {
    id: "birth_date",
    title: "Укажите вашу дату рождения",
    description: "Это необходимо для точного расчета метаболизма и калорий",
    type: "date",
  },
  {
    id: "height",
    title: "Ваш рост",
    type: "input",
    unit: "см",
  },
  {
    id: "weight",
    title: "Текущий вес",
    type: "input",
    unit: "кг",
  },
];

// 2. ДИНАМИЧЕСКИЕ ВЕТКИ (Подгружаются на лету сразу ПОСЛЕ экрана выбора цели "goal")
export const TARGET_QUESTIONS: Record<string, Question[]> = {
  // ================= ВЕТКА: ПОХУДЕНИЕ =================
  lose_weight: [
    {
      id: "target_weight",
      title: "Ваша цель",
      description:
        "Какой вес позволит вам чувствовать себя максимально комфортно и уверенно?",
      type: "input",
      unit: "кг",
    },
    {
      id: "reason",
      title: "Что вас мотивирует?",
      description:
        "Выберите главную причину, чтобы мы могли правильно вас поддерживать.",
      options: [
        { label: "Чувствовать себя увереннее", value: "confident" },
        { label: "Улучшить здоровье и самочувствие", value: "health" },
        { label: "Повысить физические показатели", value: "fit" },
        { label: "Вернуться в старую форму", value: "old_shape" },
      ],
    },
    {
      id: "deadline",
      title: "Как быстро вы хотите достичь результата?",
      type: "deadline_selector", // Кастомный тип для переключения на встроенный DatePicker
      options: [
        {
          label: "К определенной дате или событию",
          value: "event",
        },
        {
          label: "Плавно и без стресса для организма",
          value: "healthy",
          insight:
            "Отличный настрой! Плавное похудение лучше всего сохраняет упругость кожи и результат надолго.",
        },
      ],
    },
    {
      id: "diet_type",
      title: "Тип питания",
      description: "Есть ли у вас особые предпочтения или ограничения?",
      options: [
        { label: "Ем всё", value: "everything" },
        { label: "Веган / Вегетарианец", value: "vegan" },
        { label: "Кето / Низкоуглеводное", value: "keto" },
        { label: "Без лактозы / Глютена", value: "restrictions" },
      ],
    },
    {
      id: "main_enemy",
      title: "Ваш главный «враг» на пути к цели?",
      description: "What чаще всего мешает придерживаться плана?",
      options: [
        {
          label: "Тяга к сладкому",
          value: "sweets",
          insight:
            "Понимаем! Мы добавим в меню продукты, богатые хромом, чтобы снизить эту тягу.",
        },
        {
          label: "Любовь к фастфуду и снекам",
          value: "fastfood",
          insight:
            "Никакой пресной еды. Найдем полезные и очень вкусные альтернативы.",
        },
        {
          label: "Вечерние перекусы",
          value: "night_eating",
          insight:
            "Сделаем ужины более сытными, чтобы ночью холодильник вас не манил.",
        },
        {
          label: "Заедание стресса",
          value: "stress",
          insight: "Включим антистресс-продукты и магний в ваш рацион.",
        },
      ],
    },
    {
      id: "cooking_time",
      title: "Сколько времени вы готовы тратить на готовку?",
      options: [
        { label: "Минимум (кафе, доставка, полуфабрикаты)", value: "none" },
        { label: "До 20-30 минут в день", value: "fast" },
        { label: "Люблю готовить и пробовать новое", value: "slow" },
        { label: "Готовлю сразу на несколько дней", value: "meal_prep" },
      ],
    },
    {
      id: "fail_reason",
      title: "Из-за чего не получалось похудеть раньше?",
      options: [
        {
          label: "Слишком жесткие ограничения",
          value: "strict",
          insight:
            "В этот раз будет иначе. Мы оставим место для ваших любимых продуктов!",
        },
        { label: "Не было видно результата", value: "no_progress" },
        { label: "Срывы и потеря мотивации", value: "boredom" },
        { label: "Это мой первый раз", value: "first_time" },
      ],
    },
    {
      id: "sleep_quality",
      title: "Сколько часов вы обычно спите?",
      options: [
        {
          label: "Меньше 6 часов",
          value: "poor",
          insight:
            "Недосып усиливает чувство голода. Постараемся помочь вам с режимом.",
        },
        { label: "7-8 часов", value: "good" },
        { label: "Больше 8 часов", value: "excellent" },
      ],
    },
    {
      id: "stress_level",
      title: "Как бы вы оценили свой уровень стресса сейчас?",
      options: [
        { label: "Спокоен как удав", value: "low" },
        { label: "Бывают напряженные дни", value: "medium" },
        {
          label: "Постоянный стресс / Выгорание",
          value: "high",
          insight:
            "Стресс повышает уровень кортизола, который мешает худеть. Мы обязательно учтем это в плане.",
        },
      ],
    },
  ],

  // ================= ВЕТКА: НАБОР МЫШЦ =================
  gain_muscle: [
    {
      id: "target_weight",
      title: "Целевой вес",
      type: "input",
      unit: "кг",
    },
    {
      id: "body_type",
      title: "Тип телосложения",
      options: [
        {
          label: "Худощавое (Эктоморф)",
          value: "ectomorph",
          insight: "Вам нужен повышенный профицит калорий.",
        },
        { label: "Среднее (Мезоморф)", value: "mesomorph" },
        { label: "Крупное (Эндоморф)", value: "endomorph" },
      ],
    },
    {
      id: "training_place",
      title: "Где планируете тренироваться?",
      options: [
        { label: "Тренажерный зал", value: "gym" },
        { label: "Уличная площадка", value: "street" },
        { label: "Дома", value: "home" },
      ],
    },
    {
      id: "experience",
      title: "Ваш опыт в зале",
      options: [
        { label: "Новичок (0-6 мес)", value: "beginner" },
        { label: "Средний (1-2 года)", value: "intermediate" },
        { label: "Продвинутый", value: "pro" },
      ],
    },
    {
      id: "appetite",
      title: "Ваш аппетит",
      description: "Насколько легко вам съедать большие порции?",
      options: [
        {
          label: "Сложно заставить себя есть",
          value: "low",
          insight: "Мы предложим более калорийно-плотные продукты.",
        },
        { label: "Ем много без проблем", value: "high" },
      ],
    },
    {
      id: "supplements",
      title: "Отношение к спортпиту",
      options: [
        { label: "Готов использовать (протеин и др.)", value: "yes" },
        { label: "Только натуральная еда", value: "no" },
      ],
    },
    {
      id: "mass_quality",
      title: "Какое качество массы важно?",
      options: [
        { label: "Максимальный объем", value: "fast" },
        { label: "Сухая мышечная масса (Рельеф)", value: "clean" },
      ],
    },
  ],

  // ================= ВЕТКА: ЗОЖ И ДЕФИЦИТЫ =================
  maintain: [
    {
      id: "energy_level",
      title: "Уровень энергии",
      options: [
        {
          label: "Просыпаюсь уставшим",
          value: "tired",
          insight: "Похоже на дефицит железа или B12.",
        },
        {
          label: "Провал после обеда",
          value: "slump",
          insight: "Добавим продукты с низким ГИ для стабильности.",
        },
        { label: "Стабильный уровень", value: "good" },
      ],
    },
    {
      id: "skin_hair",
      title: "Состояние кожи и волос",
      options: [
        {
          label: "Сухость / Шелушение",
          value: "dry",
          insight: "Нужно больше полезных жиров Омега-3.",
        },
        {
          label: "Выпадение волос",
          value: "hair",
          insight: "Проверим уровень белка и цинка.",
        },
        {
          label: "Частые высыпания",
          value: "acne",
          insight: "Снизим количество сахара в рационе.",
        },
      ],
    },
    {
      id: "digestion",
      title: "Комфорт после еды",
      options: [
        {
          label: "Тяжесть / Вздутие",
          value: "bloating",
          insight: "Добавим ферментированные продукты.",
        },
        { label: "Сонливость", value: "sleepy" },
        { label: "Прилив сил", value: "active" },
      ],
    },
    {
      id: "coffee",
      title: "Зависимость от кофеина",
      description: "Сколько чашек в день?",
      options: [
        { label: "0-1 чашка", value: "low" },
        { label: "2-3 чашки", value: "medium" },
        {
          label: "4+ чашки",
          value: "high",
          insight: "Кофеин в избытке вымывает магний и кальций.",
        },
      ],
    },
    {
      id: "main_concern",
      title: "Что беспокоит чаще всего?",
      options: [
        {
          label: "Тяга к сладкому",
          value: "sugar",
          insight: "Это может быть нехватка хрома или магния.",
        },
        {
          label: "Судороги в мышцах",
          value: "cramps",
          insight: "Явный признак нехватки магния или калия.",
        },
        {
          label: "Кровоточивость десен",
          value: "gums",
          insight: "Стоит обратить внимание на витамин С.",
        },
      ],
    },
  ],
};
