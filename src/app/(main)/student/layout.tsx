"use client";

import { Activity, Utensils, BarChart3, User } from "lucide-react";
import FoodConstructor from "@/components/food/food-constructor";
import { ActivityModal } from "@/components/student/activity-modal";
import { useTabsLayoutLogic } from "@/hooks/use-tabs-layout-logic";
import { StudentQuickMenu } from "@/components/student/student-quick-menu";
import { StudentBottomBar } from "@/components/student/student-bottom-bar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const LEFT_TABS = [
  { id: "/student/diary", label: "Дневник", icon: Utensils },
  { id: "/student", label: "Трекер", icon: Activity },
];

const RIGHT_TABS = [
  { id: "/student/history", label: "История", icon: BarChart3 },
  { id: "/student/settings", label: "Профиль", icon: User },
];

export default function StudentTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
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
  } = useTabsLayoutLogic();

  // Запрашиваем профиль текущего юзера из TanStack Query (берется из кэша приложения)
  const { data: profile } = useQuery({
    queryKey: ["user-profile-current"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("weight, gender")
        .eq("id", user.id)
        .single();
      return data;
    },
  });

  // Запасные фитнес-дефолты, если профиль еще грузится или пустой
  const userWeight = Number(profile?.weight) || 70;
  const userGender = (profile?.gender as "male" | "female") || "female";

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <main
        className={
          isConstructorOpen
            ? "pb-6"
            : "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-24"
        }
      >
        {children}
      </main>

      {activeMealType && (
        <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="max-w-6xl mx-auto p-4 md:p-8 pb-20">
            <FoodConstructor
              serverToday={selectedDate}
              onClose={handleProgrammaticClose}
            />
          </div>
        </div>
      )}

      {/* ИСПРАВЛЕНО: Убраны лишние пропсы калорий и переданы актуальные вес и пол из базы */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={closeActivityModal}
        formData={dashState.formData}
        setFormData={dashActions.setFormData}
        userWeight={userWeight}
        userGender={userGender}
        onSave={async () => {
          dashActions.handleSave();
          closeActivityModal();
        }}
        isSaving={dashState.isSaving}
      />

      {isMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-40 animate-in fade-in duration-200" />
      )}

      {!isConstructorOpen && (
        <div
          ref={menuRef}
          className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-[calc(1.2rem+env(safe-area-inset-bottom))] md:pb-6"
        >
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-900/15 via-slate-900/05 to-transparent pointer-events-none -z-10" />

          {isMenuOpen && (
            <StudentQuickMenu
              onAddMeal={handleAddMeal}
              onAddActivity={handleAddActivity}
              onFastWaterAdd={handleFastWaterAdd}
              isWaterDisabled={isWaterDisabled}
              isPending={isPending}
            />
          )}

          <StudentBottomBar
            pathname={pathname}
            leftTabs={LEFT_TABS}
            rightTabs={RIGHT_TABS}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
          />
        </div>
      )}
    </div>
  );
}
