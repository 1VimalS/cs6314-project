import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Global UI state
  advancedEnabled: false,

  // Actions
  setAdvancedEnabled: (enabled) => set({ advancedEnabled: enabled }),
  toggleAdvancedEnabled: () => set((state) => ({ advancedEnabled: !state.advancedEnabled })),
}));

export default useAppStore;