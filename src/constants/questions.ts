export const QUESTIONS = {
  // ВЕТКА: ПОХУДЕНИЕ
  lose_weight: [
    {
      id: "deadline",
      title: "Когда вы хотите достичь результата?",
      options: [
        { label: "К определенной дате/событию", value: "event" },
        {
          label: "Максимально плавно и правильно",
          value: "healthy",
          insight: "Это лучший выбор для метаболизма и кожи!",
        },
      ],
    },
    {
      id: "diet_type",
      title: "Тип питания",
      description: "Есть ли у вас предпочтения или ограничения?",
      options: [
        { label: "Ем всё", value: "everything" },
        { label: "Веган / Вегетарианец", value: "vegan" },
        { label: "Кето / Низкоуглеводное", value: "keto" },
        { label: "Без лактозы / Глютена", value: "restrictions" },
      ],
    },
    {
      id: "main_enemy",
      title: "Ваш главный «враг» в диете",
      options: [
        {
          label: "Тяга к сладкому",
          value: "sweets",
          insight: "Мы добавим в меню продукты, богатые хромом.",
        },
        {
          label: "Любовь к фастфуду",
          value: "fastfood",
          insight: "Найдем полезные альтернативы с ярким вкусом.",
        },
        {
          label: "Вечерние перекусы",
          value: "night_eating",
          insight: "Сбалансируем ужин, чтобы не хотелось перекусить.",
        },
        {
          label: "Стресс (заедание)",
          value: "stress",
          insight: "Включим антистресс-продукты в ваш рацион.",
        },
      ],
    },
    {
      id: "cooking_time",
      title: "Время на готовку",
      options: [
        { label: "Не готовлю (кафе/доставка)", value: "none" },
        { label: "До 20 минут", value: "fast" },
        { label: "Люблю сложные блюда", value: "slow" },
      ],
    },
    {
      id: "fail_reason",
      title: "Почему не получалось раньше?",
      options: [
        {
          label: "Жесткие ограничения",
          value: "strict",
          insight: "В этот раз мы добавим ваши любимые продукты!",
        },
        { label: "Не видел результата", value: "no_progress" },
        { label: "Быстро надоело / Срыв", value: "boredom" },
      ],
    },
    {
      id: "stress_level",
      title: "Ваш уровень стресса",
      options: [
        { label: "Низкий", value: "low" },
        {
          label: "Высокий (выгорание)",
          value: "high",
          insight: "Стресс повышает кортизол, мы учтем это в плане.",
        },
      ],
    },
    {
      id: "training_mode",
      title: "Отношение к спорту",
      options: [
        { label: "Обожаю тренировки", value: "pro" },
        { label: "Готов ради результата", value: "disciplined" },
        {
          label: "Ненавижу спорт",
          value: "none",
          insight: "Ничего страшного, мы сделаем упор на питание.",
        },
      ],
    },
  ],

  // ВЕТКА: НАБОР МЫШЦ
  gain_muscle: [
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
        { label: "Максимально быстро (+жир)", value: "fast" },
        { label: "«Чистый» набор (рельеф)", value: "clean" },
      ],
    },
  ],

  // ВЕТКА: ЗОЖ И ДЕФИЦИТЫ
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
