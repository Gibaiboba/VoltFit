//  МАТРИЦА РЕЦЕПТОВ
export const MOCK_RECIPES_DATABASE = [
  {
    id: 1,
    title: "Киноа-боул с авокадо и яйцом пашот",
    category: "Завтрак",
    time: "15 мин",
    calories: 420,
    goals: ["lose_weight", "maintain"],
    dietTypes: ["everything", "vegan", "restrictions"],
    benefits: "Стабилизирует сахар, защищает от упадка сил после обеда.",
    badges: ["Низкий ГИ", "Полезные жиры"],
    image: "🥑",
  },
  {
    id: 2,
    title: "Теплый салат со шпинатом и тунцом",
    category: "Обед",
    time: "10 мин",
    calories: 360,
    goals: ["lose_weight", "maintain"],
    dietTypes: ["everything", "restrictions"],
    benefits:
      "Высокое содержание железа и B12 — устраняет утреннюю разбитость.",
    badges: ["Железо (Fe)", "Омега-3"],
    image: "🥗",
  },
  {
    id: 3,
    title: "Высокобелковый смузи с бананом и арахисовой пастой",
    category: "Перекус",
    time: "5 мин",
    calories: 580,
    goals: ["gain_muscle"],
    dietTypes: ["everything", "vegan"],
    benefits:
      "Жидкие калории. Идеально, если вам тяжело съедать большие порции.",
    badges: ["Плотный профицит", "Легкое усвоение"],
    image: "🥤",
  },
  {
    id: 4,
    title: "Стейк из индейки с запеченной брокколи",
    category: "Ужин",
    time: "25 мин",
    calories: 490,
    goals: ["lose_weight", "gain_muscle", "maintain"],
    dietTypes: ["everything", "restrictions"],
    benefits:
      "Сытный ужин. Включает магний — блокирует ночную тягу к сладкому и перекусам.",
    badges: ["Магний (Mg)", "Максимум белка"],
    image: "🥩",
  },
];
