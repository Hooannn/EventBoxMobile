import {PropsWithChildren, useEffect} from 'react';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, {AndroidStyle} from '@notifee/react-native';
import {requestNotifications} from 'react-native-permissions';
import {isReadyRef, navigationRef} from 'react-navigation-helpers';
import {CommonActions} from '@react-navigation/native';
import {SCREENS} from '../navigation';

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
          navigationRef.navigate(SCREENS.EVENT_DETAIL, {id: eventId});
        }
      }

      if (data.type === 'order') {
        const orderId = data.order_id;
        if (isReadyRef.current) {
          navigationRef.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: SCREENS.PAYMENT_SUCCESS, params: {orderId}}],
            }),
          );
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
          style: message.notification?.android?.imageUrl
            ? {
                type: AndroidStyle.BIGPICTURE,
                picture: message.notification?.android?.imageUrl ?? '',
              }
            : undefined,
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
