import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 사용자 정보 타입
interface User {
  id?: string;
  email?: string;
  name?: string;
  role?: string;

  age?: number;
  status?: number; // 성향 저장 0 ~ 3
  profileImage?: string;
}


interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;

  // actions
  setToken: (token: string) => void;
  logout: () => void;
  checkLoginFromUrl: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      user: null,
      loading: true,

      // 로그인 성공 시 토큰 저장
      setToken: (token: string) => {
        set({
          token,
          isAuthenticated: true,
          loading: false,
        });

        // 토큰 저장 후 내 정보 즉시 동기화
        get().fetchMe();
      },

      // 로그아웃
      logout: () => {
        set({
          token: null,
          isAuthenticated: false,
          user: null,
          loading: false,
        });
        try {
          Object.keys(localStorage).forEach((k) => {
            if (k.startsWith("mora:likes:my:")) {
              localStorage.removeItem(k);
            }
          });
        } catch {}
        localStorage.removeItem("auth-storage");
      },
      

      // OAuth / SSO 등 URL에 token 붙어오는 경우 처리
      // 토큰 파싱만 (redirect는 하지 않음)
      checkLoginFromUrl: () => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          set({ loading: false });
          return;
        }

        // 토큰 저장
        set({
          token,
          isAuthenticated: true,
          loading: false,
        });

        // URL에서 token 제거
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // 내 정보 조회
        get().fetchMe();
      },

      // 내 정보 조회
      fetchMe: async () => {
        const { token } = get();

        if (!token) {
          set({ loading: false });
          return;
        }

        try {
          const res = await axios.get(`${API_BASE_URL}/user/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          set({
            user: res.data,
            isAuthenticated: true,
            loading: false,
          });
        } catch (e) {
          console.error("fetchMe failed:", e);
          // 토큰 만료 / 위조 → 강제 로그아웃
          get().logout();
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),

      // 새로고침/재접속 시에도 token 있으면 내정보 다시 조회
      // 로그아웃 전까지 정보 유지
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        if (state.token) {
          state.fetchMe(); // token 있으면 /user/me 호출해서 user 채움
        } else {
          // state.loading = false; // token 없으면 로딩 끝
          state.logout(); // 또는 아래 한 줄로도 가능
          // logout으로 초기화(loading false 포함)하는게 깔끔
        }
      },
    }
  )
);
