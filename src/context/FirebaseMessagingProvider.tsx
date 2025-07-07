import {PropsWithChildren, useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import {requestNotifications} from 'react-native-permissions';

export default function FirebaseMessagingProvider({
  children,
}: PropsWithChildren) {
  const createDefaultFCMChannel = async () => {
    return notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
  };

  const handleInitialNotification = async () => {
    const notificationOpen = await messaging().getInitialNotification();
    if (notificationOpen) {
      const {data} = notificationOpen;
      console.log('Notification caused app to open from quit state:', data);
      // Handle the notification data here
    }
  };

  const requestPermission = async () => {
    const response = await requestNotifications(['alert', 'badge', 'sound']);
    if (response.status === 'granted') {
      console.log('Notification permission granted');
    } else {
      console.log('Notification permission denied');
    }
  };

  useEffect(() => {
    const unsubscribeOnMessage = messaging().onMessage(message => {
      notifee.displayNotification({
        title: message.notification?.title,
        body: message.notification?.body,
        android: {
          channelId: 'default',
          pressAction: {
            id: 'default',
          },
        },
      });
    });

    const unsubscribeNotificationOpenedApp =
      messaging().onNotificationOpenedApp(notificationOpen => {
        console.log(
          'Notification caused app to open from background state:',
          notificationOpen.notification,
        );
        // Handle the notification data here
      });

    const unsubscribeOnTokenRefresh = messaging().onTokenRefresh(token => {
      console.log('New token:', token);
      // Save the new token to your server or perform any other action
    });

    handleInitialNotification();
    requestPermission();
    createDefaultFCMChannel();

    return () => {
      unsubscribeOnMessage();
      unsubscribeNotificationOpenedApp();
      unsubscribeOnTokenRefresh();
    };
  }, []);
  return children;
}
