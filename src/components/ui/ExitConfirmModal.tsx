"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function ExitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Вы уверены, что хотите выйти?",
  description = "Все заполненные данные анкетирования будут удалены",
}: ExitConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Задний полупрозрачный фон (Оверлей) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Карточка модального окна */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center z-10"
          >
            {/* Кнопка закрытия "крестик" в углу */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Иконка предупреждения из Lucide */}
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4 animate-pulse">
              <AlertTriangle size={24} />
            </div>

            {/* Текст */}
            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">
              {title}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              {description}
            </p>

            {/* Кнопки действий */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors active:scale-[0.98]"
              >
                Отмена
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/10 active:scale-[0.98]"
              >
                Да, выйти
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
