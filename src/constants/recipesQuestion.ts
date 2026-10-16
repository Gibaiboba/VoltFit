// 1. БАЗА ДИНАМИЧЕСКИХ ВНУТРЕННИХ ВОПРОСОВ ПИТАНИЯ
export const INTERNAL_DIET_QUESTIONS = {
  lose_weight: [
    {
      id: "diet_type",
      title: "Особые предпочтения в еде",
      description: "Мы исключим нежелательные продукты из вашего меню",
      options: [
        { label: "Ем абсолютно всё", value: "everything" },
        { label: "Вегетарианское меню", value: "vegan" },
        { label: "Без лактозы / Без глютена", value: "restrictions" },
      ],
    },
    {
      id: "cooking_time",
      title: "Сколько времени есть на готовку?",
      description: "Подберем блюда под ваш темп жизни",
      options: [
        { label: "Минимум (до 15 минут, простые сборки)", value: "fast" },
        { label: "До 30-40 минут (люблю готовить дома)", value: "normal" },
      ],
    },
  ],
  gain_muscle: [
    {
      id: "meal_frequency",
      title: "Количество приемов пищи",
      description: "Как вам комфортнее распределить профицит калорий?",
      options: [
        { label: "3 плотных приема пищи в день", value: "3_meals" },
        {
          label: "4-5 приемов (часто, но небольшими порциями)",
          value: "5_meals",
        },
      ],
    },
    {
      id: "cooking_time",
      title: "Время на готовку",
      description: "Сложность и скорость приготовления блюд",
      options: [
        { label: "Быстрые калорийные рецепты (до 20 мин)", value: "fast" },
        {
          label: "Полноценный meal prep (готовка на 2-3 дня сразу)",
          value: "meal_prep",
        },
      ],
    },
  ],
  maintain: [
    {
      id: "secondary_concern",
      title: "Что еще вас беспокоит, кроме утомляемости?",
      description: "Это поможет точнее настроить баланс витаминов",
      options: [
        { label: "Частые вздутия / Тяжесть после еды", value: "digestion" },
        { label: "Сухость кожи / Шелушение", value: "skin" },
        { label: "Ничего из перечисленного, всё в порядке", value: "none" },
      ],
    },
  ],
};
