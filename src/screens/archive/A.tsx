import React from 'react';
import {View} from 'react-native';
import {Button, Text} from 'tamagui';
import messaging from '@react-native-firebase/messaging';
import useAppStore from '../../store/app.store';
import useAuthStore from '../../store/auth.store';
export default function ArchiveScreen() {
  const resetAuth = useAuthStore(state => state.reset);
  const resetApp = useAppStore(state => state.reset);
  const setPushToken = useAppStore(state => state.setPushToken);
  const pushToken = useAppStore(state => state.pushToken);
  const getPushToken = async () => {
    try {
      const token = await messaging().getToken();
      setPushToken(token);

      if (pushToken !== token) {
        console.log('Push token updated:', token);
      }

      return token;
    } catch (error) {
      console.log('Error getting push token:', error);
      return '';
    }
  };

  const logout = async () => {
    try {
      await messaging().deleteToken();
      setPushToken('');
      resetAuth();
      resetApp();
      console.log('Logged out and push token deleted');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Button
          onPress={async () => {
            const token = await getPushToken();
            console.log('Push Token:', token);
          }}
          theme="blue">
          Checkout
        </Button>

        <Button onPress={logout} theme="blue">
          Logout
        </Button>

        <Text>Push Token: {pushToken ? pushToken : 'No token available'}</Text>
      </View>
    </>
  );
}
