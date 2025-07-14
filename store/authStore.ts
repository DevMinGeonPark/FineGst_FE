import { create } from "zustand";

interface User {
  UserId: string;
  UserNm: string;
  Point: number;
}

interface AuthState {
  // 상태
  isLoggedIn: boolean;
  user: User | null;

  // 액션
  login: (userData: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  // 초기 상태
  isLoggedIn: false,
  user: null,

  // 액션들
  login: (userData: User) =>
    set({
      isLoggedIn: true,
      user: userData,
    }),

  logout: () =>
    set({
      isLoggedIn: false,
      user: null,
    }),

  setUser: (user: User | null) => set({ user }),

  setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
}));

export default useAuthStore;
