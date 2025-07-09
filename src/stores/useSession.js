import { create } from "zustand";
import { decodeJWT } from "../utilities/decodeJWT";

let user = null;
let isLoggedIn = false;

const token = localStorage.getItem("token");
if (token) {
  const decodedPayload = decodeJWT(token);
  if (decodedPayload) {
    user = decodedPayload;
    isLoggedIn = true;
  }
}

export const useSession = create((set) => ({
  user,
  isLoggedIn,

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
