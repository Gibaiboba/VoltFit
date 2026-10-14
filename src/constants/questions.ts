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

// 1. БАЗОВЫЕ ВОПРОСЫ
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

// 2. ДИНАМИЧЕСКИЕ ВЕТКИ
export const TARGET_QUESTIONS: Record<string, Question[]> = {
  // ================= ВЕТКА: ПОХУДЕНИЕ =================
  lose_weight: [
    {
      id: "target_weight",
      title: "Ваша цель",
      description:
        "Какой вес позволит вам чувствовать себя максимально комфортно?",
      type: "input",
      unit: "кг",
    },
    {
      id: "deadline",
      title: "Как быстро вы хотите достичь результата?",
      type: "deadline_selector",
      options: [
        { label: "К определенной дате или событию", value: "event" },
        {
          label: "Плавно и без стресса для организма",
          value: "healthy",
          insight:
            "Отличный настрой! Плавное похудение лучше всего сохраняет упругость кожи и результат надолго.",
        },
      ],
    },
    {
      id: "main_enemy",
      title: "Ваш главный «враг» на пути к цели?",
      description: "Что чаще всего мешает придерживаться плана?",
      options: [
        {
          label: "Тяга к сладкому",
          value: "sweets",
          insight:
            "Понимаем! Мы автоматически добавим в ваше меню рецепты, богатые хромом, чтобы снизить эту тягу.",
        },
        {
          label: "Любовь к фастфуду и снекам",
          value: "fastfood",
          insight:
            "Никакой пресной еды. Мы адаптируем меню под полезные и вкусные альтернативы фастфуду!",
        },
        {
          label: "Вечерние перекусы",
          value: "night_eating",
          insight:
            "Сделаем ваши ужины более сытными, чтобы ночью холодильник вас не манил.",
        },
        {
          label: "Заедание стресса",
          value: "stress",
          insight:
            "Учтем это! Включим антистресс-продукты и магний в ваш рацион.",
        },
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
        {
          label: "Не было видно прогресса",
          value: "no_progress",
          insight:
            "Наш наглядный интерактивный трекер покажет даже минимальные изменения тела.",
        },
        { label: "Срывы и потеря мотивации", value: "boredom" },
        { label: "Это мой первый раз", value: "first_time" },
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
      description: "Определяет стартовую скорость обмена веществ",
      options: [
        {
          label: "Худощавое (Эктоморф)",
          value: "ectomorph",
          insight:
            "Вам нужен повышенный профицит калорий. Автоматически добавим +200 ккал к вашей норме!",
        },
        { label: "Среднее (Мезоморф)", value: "mesomorph" },
        { label: "Крупное (Эндоморф)", value: "endomorph" },
      ],
    },
    {
      id: "appetite",
      title: "Ваш аппетит",
      description: "Насколько легко вам съедать большие порции еды?",
      options: [
        {
          label: "Сложно заставить себя есть",
          value: "low",
          insight:
            "Поняли. На странице рецептов предложим более калорийно-плотные блюда и смузи.",
        },
        { label: "Ем много без особых проблем", value: "high" },
      ],
    },
  ],

  // ================= ВЕТКА: ЗОЖ И ДЕФИЦИТЫ =================
  maintain: [
    {
      id: "energy_level",
      title: "Ваш текущий уровень энергии",
      description: "Что беспокоит вас чаще всего в течение дня?",
      options: [
        {
          label: "Просыпаюсь уставшим",
          value: "tired",
          insight:
            "Похоже на дефицит железа или B12. Мы поднимем приоритет продуктов, богатых Fe.",
        },
        {
          label: "Провал энергии после обеда",
          value: "slump",
          insight:
            "Добавим в меню продукты с низким ГИ для стабильного уровня сахара.",
        },
        { label: "Стабильный и хороший уровень", value: "good" },
      ],
    },
    {
      id: "main_concern",
      title: "Что беспокоит чаще всего?",
      options: [
        {
          label: "Тяга к сладкому",
          value: "sugar",
          insight:
            "Это может быть нехватка хрома или магния. Скорректируем баланс минералов.",
        },
        {
          label: "Судороги в мышцах",
          value: "cramps",
          insight:
            "Явный признак нехватки магния или калия. Обязательно учтем это в плане.",
        },
        {
          label: "Кровоточивость десен",
          value: "gums",
          insight:
            "Стоит обратить внимание на витамин С. Добавим полезные смузи в рацион.",
        },
      ],
    },
  ],
};
