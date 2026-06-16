import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserInfo {
  name: string;
  school?: string;
}

interface UserContextValue {
  user: UserInfo | null;
  isLoaded: boolean;
  login: (info: UserInfo) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  isLoaded: false,
  login: async () => {},
  logout: async () => {},
});

const USER_STORAGE_KEY = '@twi_user_info';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(USER_STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setUser(JSON.parse(data));
        } catch {
          // ignore
        }
      }
      setIsLoaded(true);
    });
  }, []);

  const login = async (info: UserInfo) => {
    setUser(info);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(info));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <UserContext.Provider value={{ user, isLoaded, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
