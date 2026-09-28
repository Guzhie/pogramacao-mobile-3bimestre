import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { login } from "@/integration/loginIntegration";

interface User {
  userId: string;
  username: string;
  roles: string[];
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  loginUser: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  async function loginUser(username: string, password: string) {
    const response = await login(username, password);

    setUser(response);
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}