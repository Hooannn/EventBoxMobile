import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createJSONStorage, persist} from 'zustand/middleware';
import {IUser} from '../types';
type AuthStoreState = {
  isLoggedIn: boolean;
  user?: IUser;
  accessToken?: string;
  refreshToken?: string;
};

type AuthStoreActions = {
  setLoggedIn: (isLoggedIn: boolean) => void;
  setUser: (user: IUser) => void;
  setAccessToken: (accessToken: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  reset: () => void;
};

const initialState: AuthStoreState = {
  isLoggedIn: false,
  user: undefined,
  accessToken: undefined,
  refreshToken: undefined,
};

const useAuthStore = create<AuthStoreState & AuthStoreActions>()(
  persist(
    set => ({
      ...initialState,
      setLoggedIn: isLoggedIn => set(_ => ({isLoggedIn})),
      setUser: user => set(_ => ({user})),
      setAccessToken: accessToken => set(_ => ({accessToken})),
      setRefreshToken: refreshToken => set(_ => ({refreshToken})),
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useAuthStore;
