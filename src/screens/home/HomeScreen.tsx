import React from 'react';
import {View} from 'react-native';
import {Button, Text} from 'tamagui';
import messaging from '@react-native-firebase/messaging';
import useAppStore from '../../store/app.store';
export default function HomeScreen() {
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

        <Text>Push Token: {pushToken ? pushToken : 'No token available'}</Text>
      </View>
    </>
  );
}
