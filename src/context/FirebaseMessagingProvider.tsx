import {PropsWithChildren, useEffect} from 'react';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, {AndroidStyle} from '@notifee/react-native';
import {requestNotifications} from 'react-native-permissions';
import {isReadyRef, navigationRef} from 'react-navigation-helpers';

export default function FirebaseMessagingProvider({
  children,
}: PropsWithChildren) {
  const createDefaultFCMChannel = async () => {
    return notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
  };

  const handleEventData = (
    notificationOpen: FirebaseMessagingTypes.RemoteMessage,
  ) => {
    const {data} = notificationOpen;
    if (data) {
      if (data.type === 'event') {
        const eventId = data.event_id;
        if (isReadyRef.current) {
          navigationRef.navigate('EventDetail', {id: eventId});
        }
      }
    }
  };

  const handleInitialNotification = async () => {
    const notificationOpen = await messaging().getInitialNotification();
    if (notificationOpen) {
      handleEventData(notificationOpen);
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
        data: message.data,
        android: {
          channelId: 'default',
          pressAction: {
            id: 'default',
          },
          style: {
            type: AndroidStyle.BIGPICTURE,
            picture: message.notification?.android?.imageUrl ?? '',
          },
        },
      });
    });

    const unsubscribeNotificationOpenedApp =
      messaging().onNotificationOpenedApp(notificationOpen => {
        handleEventData(notificationOpen);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return children;
}
