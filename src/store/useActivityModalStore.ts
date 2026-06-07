import { create } from "zustand";

interface ActivityModalState {
  isActivityModalOpen: boolean;
  openActivityModal: () => void;
  closeActivityModal: () => void;
}

export const useActivityModalStore = create<ActivityModalState>((set) => ({
  isActivityModalOpen: false,
  openActivityModal: () => set({ isActivityModalOpen: true }),
  closeActivityModal: () => set({ isActivityModalOpen: false }),
}));
