import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, department?: string, studentId?: string, role?: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load token and profile on mount
  useEffect(() => {
    async function loadStoredAuth() {
      const storedToken = localStorage.getItem('unimind_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          // Token expired or invalid
          localStorage.removeItem('unimind_token');
        }
      } catch (err) {
        console.error('Error fetching stored profile:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('unimind_token', data.token);
        setIsLoading(false);
        return true;
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Network error during login.');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    department?: string,
    studentId?: string,
    role?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ name, email, password, department, studentId, role }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('unimind_token', data.token);
        setIsLoading(false);
        return true;
      } else {
        setError(data.message || 'Registration failed.');
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Network error during registration.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('unimind_token');
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
