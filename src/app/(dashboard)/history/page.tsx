"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { SavedMeal } from "@/types/food";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Utensils,
  Loader2,
  Trash2,
  Scale,
  Plus,
  AlertCircle,
  RefreshCw,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const [meals, setMeals] = useState<SavedMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Пользователь не авторизован");

      const { data, error: dbError } = await supabase
        .from("user_meals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (dbError) throw dbError;

      // Безопасное приведение через проверку наличия данных
      setMeals((data as SavedMeal[]) || []);
    } catch (err: unknown) {
      let errorMessage = "Произошла непредвиденная ошибка";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = (err as { message: string }).message;
      }

      setError(errorMessage);
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const { error: delError } = await supabase
        .from("user_meals")
        .delete()
        .eq("id", id);

      if (delError) throw delError;

      setMeals((prev) => prev.filter((m) => m.id !== id));
      setConfirmDeleteId(null);
    } catch {
      alert("Не удалось удалить запись");
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <Loader2 className="animate-spin mb-2 text-blue-500" size={32} />
        <p className="animate-pulse">Загружаем вашу историю...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-20 max-w-md mx-auto p-8 text-center bg-red-50 rounded-3xl border border-red-100">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={40} />
        <h2 className="text-red-900 font-bold mb-2">Произошла ошибка</h2>
        <p className="text-red-600 text-sm mb-6">{error}</p>
        <button
          onClick={fetchHistory}
          className="flex items-center gap-2 mx-auto px-6 py-2 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-all"
        >
          <RefreshCw size={16} /> Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="mt-20 max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          История питания
        </h1>
        <Link
          href="/products"
          className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold hover:bg-blue-100 transition-colors"
        >
          <Plus size={16} /> Новый расчет
        </Link>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Utensils className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">
            История пуста. Самое время что-нибудь съесть!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className={`bg-white border transition-all duration-200 rounded-2xl overflow-hidden ${
                expandedId === meal.id
                  ? "ring-2 ring-blue-500 border-transparent shadow-lg"
                  : "border-gray-100 shadow-sm hover:border-blue-200"
              }`}
            >
              <div
                onClick={() =>
                  setExpandedId(expandedId === meal.id ? null : meal.id)
                }
                className="p-5 cursor-pointer select-none"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar size={12} />
                    {new Date(meal.created_at).toLocaleString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {confirmDeleteId === meal.id ? (
                      <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-100 animate-in fade-in zoom-in duration-200">
                        <button
                          onClick={() => handleDelete(meal.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          disabled={isDeleting === meal.id}
                        >
                          {isDeleting === meal.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Check size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(meal.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <h3 className="font-bold text-lg text-gray-800">
                    Прием пищи #{meal.id.slice(0, 4)}
                  </h3>
                  <div className="text-right leading-none">
                    <span className="text-2xl font-black text-gray-900">
                      {Math.round(meal.total_kcal)}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-1 uppercase font-black">
                      ккал
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 mt-3">
                  <div className="text-xs font-bold text-orange-500">
                    Б: {meal.total_p.toFixed(1)}г
                  </div>
                  <div className="text-xs font-bold text-yellow-600">
                    Ж: {meal.total_f.toFixed(1)}г
                  </div>
                  <div className="text-xs font-bold text-green-600">
                    У: {meal.total_c.toFixed(1)}г
                  </div>
                  <div className="ml-auto text-blue-500">
                    {expandedId === meal.id ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </div>
              </div>

              {expandedId === meal.id && (
                <div className="px-5 pb-5 bg-blue-50/30 border-t border-blue-50 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest py-3">
                    Состав блюда:
                  </p>
                  <div className="space-y-2">
                    {meal.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm bg-white p-3 rounded-xl border border-blue-100/50 shadow-sm"
                      >
                        <span className="font-medium text-gray-700">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center text-gray-400 text-xs gap-1">
                            <Scale size={12} /> {item.weight}г
                          </span>
                          <span className="font-bold text-gray-900 w-12 text-right">
                            {Math.round((item.kcal / 100) * item.weight)}{" "}
                            <span className="text-[9px] text-gray-400">кк</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
