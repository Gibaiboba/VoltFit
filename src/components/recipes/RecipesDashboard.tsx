import { motion } from "framer-motion";
import { ChefHat, Sparkles, RotateCcw } from "lucide-react";
import { RecipeCard } from "./RecipeCard";
import { Recipe } from "@/types/recipe";

interface RecipesDashboardProps {
  userGlobalGoal: string;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  contextTip: string;
  filteredRecipes: Recipe[];
  onReset: () => void;
}

const CATEGORIES = ["Все", "Завтрак", "Обед", "Ужин", "Перекус"];

export function RecipesDashboard({
  userGlobalGoal,
  selectedCategory,
  setSelectedCategory,
  contextTip,
  filteredRecipes,
  onReset,
}: RecipesDashboardProps) {
  return (
    <motion.div
      key="recipes-dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5 text-left">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
            <ChefHat className="text-emerald-500" size={32} /> Меню дня под
            контекст
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            План питания оптимизирован под цель:{" "}
            <span className="text-emerald-600 font-extrabold uppercase">
              {userGlobalGoal === "lose_weight"
                ? "Похудение"
                : userGlobalGoal === "gain_muscle"
                  ? "Набор массы"
                  : "ЗОЖ"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-200/50 p-1.5 rounded-2xl shrink-0 self-start md:self-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 p-5 rounded-[28px] bg-blue-500/5 border border-blue-500/10 items-start text-left">
        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0">
          <Sparkles size={18} />
        </div>
        <div className="space-y-0.5">
          <div className="text-[10px] font-black uppercase text-blue-500 tracking-wider">
            Анализ вашей анкеты
          </div>
          <p className="text-xs font-bold text-slate-600 leading-relaxed">
            {contextTip}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12 text-sm font-bold text-slate-400">
          Нет подходящих рецептов для выбранных фильтров.
        </div>
      )}

      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors mt-4"
      >
        <RotateCcw size={12} /> Перенастроить фильтры питания
      </button>
    </motion.div>
  );
}
