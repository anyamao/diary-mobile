import { create } from "zustand";
import api from "../api/client";

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/auth/me");
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    await api.post("/auth/login", { email, password });
    const response = await api.get("/auth/me");
    set({ user: response.data, isAuthenticated: true });
  },

  register: async (data: any) => {
    await api.post("/auth/register", data);
  },

  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },
}));
