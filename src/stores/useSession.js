import { create } from "zustand";

export const useSession = create((set) => ({
  user: null,
  isLoggedIn: false,

  initializeSession: () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      set({ user: parsedUser, isLoggedIn: true });
    } else {
      set({ user: null, isLoggedIn: false });
    }
  },

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
