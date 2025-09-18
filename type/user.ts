interface User {
  id: string;
  email: string;
  is_admin: boolean;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}
export type { User, UserContextType };
