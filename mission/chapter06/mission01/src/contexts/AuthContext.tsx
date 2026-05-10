import { createContext, useContext, useState } from "react";
import type { ResponseLoginDto } from "../types/auth";

type AuthContextType = {
  user: ResponseLoginDto | null;
  login: (data: ResponseLoginDto) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ResponseLoginDto | null>(null);

  const login = (data: ResponseLoginDto) => {
    setUser(data);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider 밖에서 사용됨");
  return context;
};
