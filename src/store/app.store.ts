import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createJSONStorage, persist} from 'zustand/middleware';
import {IEvent} from '../types';
type AppStoreState = {
  pushToken: string | null;
  deviceId: string | null;
  shouldShowOnboarding: boolean;
  layout: 'user' | 'organizer';
  currentSelectedEvent: IEvent | null;
};

type AppStoreActions = {
  setPushToken: (token: string) => void;
  setDeviceId: (deviceId: string) => void;
  setLayout: (layout: 'user' | 'organizer') => void;
  setShowOnboarding: (shouldShow: boolean) => void;
  setCurrentSelectedEvent: (event: IEvent | null) => void;
  reset: () => void;
};

const initialState: AppStoreState = {
  pushToken: null,
  deviceId: null,
  shouldShowOnboarding: true,
  currentSelectedEvent: null,
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
      setCurrentSelectedEvent: currentSelectedEvent =>
        set(_ => ({currentSelectedEvent})),
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
