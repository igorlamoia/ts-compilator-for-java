import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "@/lib/auth-cookies";
import { api } from "@/lib/api";

type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organizationId: number;
};

type AuthPayload = {
  token: string;
  user?: AuthUser;
};

type AuthContextValue = {
  userId: number | null;
  organizationId: number | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isProfileLoading: boolean;
  login: (payload: AuthPayload) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<number | null>(null);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsProfileLoading(true);

    try {
      const { data } = await api.get<AuthUser>("/auth/me");
      setUser(data);
      setUserId(data.id);
      setOrganizationId(data.organizationId);
    } catch {
      clearAuthToken();
      setUser(null);
      setUserId(null);
      setOrganizationId(null);
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getAuthToken();

    if (token) {
      void fetchProfile();
    } else {
      setUser(null);
      setIsProfileLoading(false);
    }

    setIsHydrated(true);
  }, [fetchProfile]);

  const login = useCallback(
    ({ token, user }: AuthPayload) => {
      setAuthToken(token);

      if (user) {
        setUser(user);
        setUserId(user.id);
        setOrganizationId(user.organizationId);
        setIsProfileLoading(false);
        return;
      }

      void fetchProfile();
    },
    [fetchProfile],
  );

  const logout = useCallback(() => {
    clearAuthToken();
    setUserId(null);
    setOrganizationId(null);
    setUser(null);
    setIsProfileLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      userId,
      organizationId,
      user,
      isAuthenticated: Boolean(userId),
      isHydrated,
      isProfileLoading,
      login,
      logout,
    }),
    [isHydrated, isProfileLoading, login, logout, organizationId, user, userId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
