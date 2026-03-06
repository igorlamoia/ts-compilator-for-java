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
  clearAuthCookies,
  getAuthCookies,
  setAuthCookies,
} from "@/lib/auth-cookies";
import { api } from "@/lib/api";

type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
};

type AuthPayload = {
  userId: string;
  organizationId: string;
  user?: AuthUser;
};

type AuthContextValue = {
  userId: string | null;
  organizationId: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isProfileLoading: boolean;
  login: (payload: AuthPayload) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const fetchProfile = useCallback(
    async (activeUserId: string, activeOrganizationId: string | null) => {
      setIsProfileLoading(true);

      try {
        const { data } = await api.get<AuthUser>("/auth/me", {
          headers: { "x-user-id": activeUserId },
        });
        setUser(data);
      } catch {
        // Keep auth active with a safe profile fallback.
        setUser({
          id: activeUserId,
          name: "",
          email: "",
          role: "STUDENT",
          organizationId: activeOrganizationId || "",
        });
      } finally {
        setIsProfileLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const authCookies = getAuthCookies();
    setUserId(authCookies.userId);
    setOrganizationId(authCookies.organizationId);

    if (authCookies.userId) {
      void fetchProfile(authCookies.userId, authCookies.organizationId);
    } else {
      setUser(null);
      setIsProfileLoading(false);
    }

    setIsHydrated(true);
  }, [fetchProfile]);

  const login = useCallback(
    ({ userId, organizationId, user }: AuthPayload) => {
      setAuthCookies(userId, organizationId);
      setUserId(userId);
      setOrganizationId(organizationId);

      if (user) {
        setUser(user);
        setIsProfileLoading(false);
        return;
      }

      void fetchProfile(userId, organizationId);
    },
    [fetchProfile],
  );

  const logout = useCallback(() => {
    clearAuthCookies();
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
