import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createJSONStorage, persist} from 'zustand/middleware';
type AppStoreState = {
  pushToken: string | null;
  deviceId: string | null;
  shouldShowOnboarding: boolean;
  layout: 'user' | 'organizer';
};

type AppStoreActions = {
  setPushToken: (token: string) => void;
  setDeviceId: (deviceId: string) => void;
  setLayout: (layout: 'user' | 'organizer') => void;
  setShowOnboarding: (shouldShow: boolean) => void;
  reset: () => void;
};

const initialState: AppStoreState = {
  pushToken: null,
  deviceId: null,
  shouldShowOnboarding: true,
  layout: 'user',
};

const useAppStore = create<AppStoreState & AppStoreActions>()(
  persist(
    set => ({
      ...initialState,
      setPushToken: pushToken => set(_ => ({pushToken})),
      setLayout: layout => set(_ => ({layout})),
      setDeviceId: deviceId => set(_ => ({deviceId})),
      setShowOnboarding: shouldShowOnboarding =>
        set(_ => ({shouldShowOnboarding})),
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useAppStore;
