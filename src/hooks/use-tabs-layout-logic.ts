"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useMealStore } from "@/store/useMealStore";
import { useActivityModalStore } from "@/store/useActivityModalStore";
import { useUserStore } from "@/store/useUserStore";
import { useStudentDashboard } from "@/hooks/use-student-dashboard/index";
import { useWaterTracker } from "@/hooks/use-water-tracker";
import { useServerToday } from "@/providers/DateProvider";

export function useTabsLayoutLogic() {
  const pathname = usePathname();

  // Достаем выбранную дату и текущего авторизованного пользователя
  const selectedDate = useUserStore((state) => state.selectedDate);
  const { user } = useUserStore();
  const targetId = user?.id || "";

  // Загружаем данные дашборда (работает универсально по ID сессии)
  const { state: dashState, actions: dashActions } = useStudentDashboard(
    targetId,
    selectedDate,
  );

  // Zustand-сторы для конструктора еды и модалки активности
  const activeMealType = useMealStore((state) => state.activeMealType);
  const setMealType = useMealStore((state) => state.setMealType);
  const clearItems = useMealStore((state) => state.clearItems);
  const { isActivityModalOpen, closeActivityModal, openActivityModal } =
    useActivityModalStore();

  const isConstructorOpen = Boolean(activeMealType);
  const serverToday = useServerToday();

  // Трекер воды (всегда привязан к текущему дню сервера)
  const {
    updateWater,
    isPending,
    disabled: isWaterDisabled,
  } = useWaterTracker(serverToday);

  // Стейт всплывающего меню быстрого добавления
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleCloseConstructor = useCallback(() => {
    setMealType(null);
  }, [setMealType]);

  const handleProgrammaticClose = useCallback(() => {
    if (window.history.state?.isOverlayOpen) {
      window.history.back();
    } else {
      handleCloseConstructor();
    }
  }, [handleCloseConstructor]);

  // Блокировка прокрутки страницы при открытом конструкторе продуктов
  useEffect(() => {
    document.body.style.overflow = activeMealType ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeMealType]);

  // Закрытие конструктора при нажатии системной кнопки "Назад" на смартфоне
  useEffect(() => {
    const handlePopState = () => {
      if (activeMealType) {
        handleCloseConstructor();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeMealType, handleCloseConstructor]);

  // Закрытие быстрого меню при клике в любую пустую область экрана
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Умный поиск существующего приема пищи для редактирования (UPDATE вместо CREATE)
  const handleAddMeal = (
    slotId: "breakfast" | "lunch" | "dinner" | "snack",
  ) => {
    clearItems();

    const todaysMeals = (dashState?.meals || []).filter((m) => {
      if (!m.created_at) return false;
      const mealDate = new Date(m.created_at).toISOString().split("T")[0];
      return mealDate === selectedDate;
    });

    const existingMeal = todaysMeals.find((m) => {
      let slotKey = m.meal_type;

      if (!slotKey && m.meal_name) {
        const nameLower = m.meal_name.toLowerCase();
        if (nameLower.includes("завтр")) slotKey = "breakfast";
        else if (nameLower.includes("обед")) slotKey = "lunch";
        else if (nameLower.includes("ужин")) slotKey = "dinner";
        else if (nameLower.includes("пер") || nameLower.includes("снак"))
          slotKey = "snack";
      }

      return (slotKey || "snack") === slotId;
    });

    if (existingMeal) {
      useMealStore
        .getState()
        .loadItems(existingMeal.items, slotId, existingMeal.id);
    } else {
      setMealType(slotId);
    }

    window.history.pushState({ isOverlayOpen: true }, "", "");
    setIsMenuOpen(false);
  };

  const handleAddActivity = () => {
    openActivityModal();
    setIsMenuOpen(false);
  };

  const handleFastWaterAdd = () => {
    if (isWaterDisabled || isPending) return;
    updateWater(250);
    setIsMenuOpen(false);

    toast.success("Водный баланс обновлен!", {
      description: "Успешно добавлено +250 мл воды 🥛",
      duration: 3000,
    });
  };

  return {
    pathname,
    selectedDate,
    dashState,
    dashActions,
    isActivityModalOpen,
    closeActivityModal,
    isConstructorOpen,
    activeMealType,
    isWaterDisabled,
    isPending,
    isMenuOpen,
    setIsMenuOpen,
    menuRef,
    handleProgrammaticClose,
    handleAddMeal,
    handleAddActivity,
    handleFastWaterAdd,
  };
}
