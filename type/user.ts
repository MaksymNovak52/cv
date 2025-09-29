interface User {
  id: string;
  email: string;
  is_admin: boolean;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  organization: string | null;
  setOrganization: (organization: string | null) => void;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}
export type { User, UserContextType };
