import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createJSONStorage, persist} from 'zustand/middleware';
type AppStoreState = {
  pushToken: string | null;
  deviceId: string | null;
  shouldShowOnboarding: boolean;
};

type AppStoreActions = {
  setPushToken: (token: string) => void;
  setDeviceId: (deviceId: string) => void;
  setShowOnboarding: (shouldShow: boolean) => void;
  reset: () => void;
};

const initialState: AppStoreState = {
  pushToken: null,
  deviceId: null,
  shouldShowOnboarding: true,
};

const useAppStore = create<AppStoreState & AppStoreActions>()(
  persist(
    set => ({
      ...initialState,
      setPushToken: pushToken => set(_ => ({pushToken})),
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
