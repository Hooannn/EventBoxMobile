import 'react-native-gesture-handler';
import React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import config from './src/configs/tamagui.config';
import {
  ToastProvider,
  Toast,
  ToastViewport,
  useToastState,
} from '@tamagui/toast';
import {
  useSafeAreaInsets,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import Navigation from './src/navigation';
import {TamaguiProvider} from '@tamagui/core';
import {YStack} from 'tamagui';
import FirebaseMessagingProvider from './src/context/FirebaseMessagingProvider';
const queryClient = new QueryClient();

const SafeAreaProviderWrapper = () => {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
};

const App = () => {
  const {left, top, right} = useSafeAreaInsets();
  return (
    <FirebaseMessagingProvider>
      <TamaguiProvider config={config} defaultTheme="light">
        <ToastProvider>
          <CurrentToast />

          <QueryClientProvider client={queryClient}>
            <Navigation />
          </QueryClientProvider>
        </ToastProvider>
      </TamaguiProvider>
    </FirebaseMessagingProvider>
  );
};

const CurrentToast = () => {
  const currentToast = useToastState();
  if (!currentToast || currentToast.isHandledNatively) return null;
  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{opacity: 0, scale: 0.5, y: -25}}
      exitStyle={{opacity: 0, scale: 1, y: -20}}
      y={0}
      opacity={1}
      scale={1}
      animation="100ms"
      theme={currentToast?.customData?.theme ?? 'dark'}
      viewportName={currentToast.viewportName}>
      <YStack>
        <Toast.Title>{currentToast.title}</Toast.Title>
        {!!currentToast.message && (
          <Toast.Description>{currentToast.message}</Toast.Description>
        )}
      </YStack>
    </Toast>
  );
};

export default SafeAreaProviderWrapper;
