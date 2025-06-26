import { create } from "zustand";

export const useSession = create((set) => ({
  user: null,
  isLoggedIn: false,

  initializeSession: () => {
    const storedUser = sessionStorage.getItem("user");
    const storedToken = sessionStorage.getItem("token");

    if (storedToken) {
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      set({ user: parsedUser, isLoggedIn: true });
    } else {
      set({ user: null, isLoggedIn: false });
    }
  },

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
