import { create } from "zustand";

export const useSession = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  isLoggedIn: !!localStorage.getItem("token"),

  login: (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    set({ user: userData, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, isLoggedIn: false });
  },
}));