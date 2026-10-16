import { Clock } from "lucide-react";
import { Recipe } from "@/types/recipe";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 flex flex-col justify-between text-left hover:shadow-xl transition-all relative overflow-hidden group min-h-[220px]">
      <div className="absolute right-4 top-4 text-4xl p-2 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
        {recipe.image}
      </div>

      <div className="space-y-2 max-w-[75%]">
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-md">
          {recipe.category}
        </span>
        <h3 className="text-xl font-black text-slate-900 leading-tight pt-1">
          {recipe.title}
        </h3>
        <div className="flex flex-wrap gap-1 pt-1">
          {recipe.badges.map((b) => (
            <span
              key={b}
              className="px-2 py-0.5 bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 text-[9px] font-extrabold rounded-full"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2">
        <span className="text-xs mt-0.5">✨</span>
        <p className="text-[10px] font-bold text-slate-500 leading-normal">
          {recipe.benefits}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock size={14} /> {recipe.time}
          </div>
          <span>•</span>
          <div className="text-slate-600 font-extrabold">
            {recipe.calories} ккал
          </div>
        </div>
      </div>
    </div>
  );
}
