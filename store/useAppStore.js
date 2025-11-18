import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Global UI state
  advancedEnabled: false,

  // Actions
  setAdvancedEnabled: (enabled) => set({ advancedEnabled: enabled }),
}));

export default useAppStore;