"use client";

import { useState, useRef, useEffect } from "react";
import { UserPlus, Loader2, X, Check } from "lucide-react";

interface AddStudentFormProps {
  isPending: boolean;
  onAdd: (email: string, options?: { onSuccess?: () => void }) => void;
}

export default function AddStudentForm({
  isPending,
  onAdd,
}: AddStudentFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleAddStudent = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const targetEmail = email.toLowerCase().trim();
    if (!targetEmail || isPending) return;

    onAdd(targetEmail, {
      onSuccess: () => {
        setEmail("");
        setIsOpen(false);
      },
    });
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Кнопка */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-2 h-14 w-14 sm:w-auto sm:px-5 bg-[#1e5039] hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95 whitespace-nowrap"
        title="Добавить ученика"
      >
        {isPending ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <UserPlus size={20} />
        )}
        <span className="hidden sm:inline">Добавить ученика</span>
      </button>

      {/* Всплывающее меню падает строго вниз от кнопки */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w(h-14)-80 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 origin-top-right duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Новый ученик
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleAddStudent} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="Email ученика..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                autoFocus
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-800 disabled:opacity-50 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !email.includes("@")}
              className="bg-blue-600 text-white p-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:bg-slate-100 disabled:text-slate-400 flex items-center justify-center shrink-0"
            >
              {isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Check size={16} />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
