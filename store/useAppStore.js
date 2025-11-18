import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Global UI state
  advancedEnabled: false,
  currentUser: null, // { _id, first_name, last_name, login_name }

  // Actions
  setAdvancedEnabled: (enabled) => set({ advancedEnabled: enabled }),
  setCurrentUser: (user) => set({ currentUser: user }),
  clearCurrentUser: () => set({ currentUser: null }),
}));

export default useAppStore;