import { create } from "zustand";

interface AuthStore {
  isLoggedOut: boolean;
  setLoggedOut: (value: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedOut: false,
  setLoggedOut: (value) => set({ isLoggedOut: value }),
}));
