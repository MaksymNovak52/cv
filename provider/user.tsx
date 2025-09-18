"use client";

import { getCurrentUser } from "@/service/user";
import { User, UserContextType } from "@/type";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const profile = await getCurrentUser();
      setUser(profile);
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  useEffect(() => {
    loadUser();
  }, []);

  const isAdmin = user?.is_admin ?? false;

  const value: UserContextType = {
    user,
    isLoading,
    setUser,
    refreshUser,
    isAdmin,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
