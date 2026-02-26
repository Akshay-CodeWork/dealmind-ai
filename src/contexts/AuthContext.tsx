import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dealmind_user");
    const loggedIn = localStorage.getItem("dealmind_logged_in");
    if (stored && loggedIn === "true") {
      setUser(JSON.parse(stored));
      setIsLoggedIn(true);
    }
  }, []);

  const register = (name: string, email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem("dealmind_users") || "[]");
    if (users.find((u: { email: string }) => u.email === email)) return false;
    users.push({ name, email, password });
    localStorage.setItem("dealmind_users", JSON.stringify(users));
    return true;
  };

  const login = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem("dealmind_users") || "[]");
    const found = users.find(
      (u: { email: string; password: string }) => u.email === email && u.password === password
    );
    if (!found) return false;
    const userData = { name: found.name, email: found.email };
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("dealmind_user", JSON.stringify(userData));
    localStorage.setItem("dealmind_logged_in", "true");
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("dealmind_user");
    localStorage.removeItem("dealmind_logged_in");
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
