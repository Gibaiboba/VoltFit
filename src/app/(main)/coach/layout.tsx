"use client";

import { Users, Utensils, User } from "lucide-react";
import FoodConstructor from "@/components/food/food-constructor";
import { ActivityModal } from "@/components/student/activity-modal";
import { useTabsLayoutLogic } from "@/hooks/use-tabs-layout-logic";
import { QuickMenu } from "@/components/coach/quick-menu";
import { BottomTabBar } from "@/components/coach/bottom-tab-bar";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useUserStore } from "@/store/useUserStore";

const LEFT_TABS = [
  { id: "/coach", label: "Ученики", icon: Users },
  { id: "/coach/diary", label: "Дневник", icon: Utensils },
];

const RIGHT_TABS = [{ id: "/coach/settings", label: "Профиль", icon: User }];

export default function CoachTabsLayout({
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

  // 💡 ИСПРАВЛЕНО: Забираем ID тренера из Zustand и берем профиль из общего кэша TanStack Query
  const userId = useUserStore((state) => state.user?.id);
  const { data: profile } = useUserProfile(userId);

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
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-40 animate-in fade-in" />
      )}

      {!isConstructorOpen && (
        <div
          ref={menuRef}
          className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-[calc(1.2rem+env(safe-area-inset-bottom))] md:pb-6"
        >
          {isMenuOpen && (
            <QuickMenu
              onAddMeal={handleAddMeal}
              onAddActivity={handleAddActivity}
              onFastWaterAdd={handleFastWaterAdd}
              isWaterDisabled={isWaterDisabled}
              isPending={isPending}
            />
          )}

          <BottomTabBar
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
