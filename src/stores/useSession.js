import { create } from "zustand";

export const useSession = create((set) => ({
  user: JSON.parse(sessionStorage.getItem("user")) || null,
  isLoggedIn: !!sessionStorage.getItem("token"),

  login: (userData, token) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("token", token);
    set({ user: userData, isLoggedIn: true });
  },

  logout: () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    set({ user: null, isLoggedIn: false });
  },
}));
