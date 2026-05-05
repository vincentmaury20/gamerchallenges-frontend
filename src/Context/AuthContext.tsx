import { createContext, useState, useEffect, type ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  userId: string | null;
  login: (data: { token: string; userId: string }) => void;
  logout: () => void;
  loadingAuth: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  userId: null,
  login: () => {},
  logout: () => {},
  loadingAuth: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Stores the current auth token
  const [token, setToken] = useState<string | null>(null);

  // Stores the authenticated user's ID
  const [userId, setUserId] = useState<string | null>(null);

  // Indicates whether the auth state is still loading (e.g., checking localStorage)
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Load token and userId from localStorage on first render
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedId = localStorage.getItem("userId");

    if (storedToken && storedId) {
      setToken(storedToken);
      setUserId(storedId);
    }

    setLoadingAuth(false);
  }, []);

  // Save token and userId on login
  const login = ({ token, userId }: { token: string; userId: string }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    setToken(token);
    setUserId(userId);
  };

  // Clear auth data on logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, userId, loadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
