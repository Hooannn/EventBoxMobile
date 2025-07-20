import React, {useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {isReadyRef, navigationRef} from 'react-navigation-helpers';
import useAuthStore from '../store/auth.store';
import messaging from '@react-native-firebase/messaging';
import DefaultStack from './DefaultStack';
import AuthStack from './AuthStack';
import useAppStore from '../store/app.store';
import useAxios from '../hooks/useAxios';
import {Platform} from 'react-native';
import OrganizerStack from './OrganizerStack';

export const Stack = createStackNavigator();
export const Tab = createBottomTabNavigator();

export const SCREENS = {
  HOME: 'Trang chủ',
  TICKETS: 'Vé của tôi',
  SETTINGS: 'Tài khoản',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  RESET_PASSWORD: 'ResetPassword',
  VERIFY_ACCOUNT: 'VerifyAccount',
  EVENT_DETAIL: 'EventDetail',
  TAB_NAVIGATION: 'TabNavigation',
  CHECK_OUT: 'CheckOut',
  PAYMENT: 'Payment',
  PAYMENT_PROCESSING: 'PaymentProcessing',
  PAYMENT_SUCCESS: 'PaymentSuccess',
  TICKET_ITEM_DETAIL: 'TicketItemDetail',
  ORGANIZATION: 'Organization',
  SCAN_TICKET: 'ScanTicket',
  SCAN_TICKET_RESULT: 'ScanTicketResult',
};

const Navigation = () => {
  React.useEffect(() => {
    return () => {
      isReadyRef.current = false;
    };
  }, []);

  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const layout = useAppStore(state => state.layout);
  const setPushToken = useAppStore(state => state.setPushToken);
  const axios = useAxios();

  useEffect(() => {
    if (!isLoggedIn) {
      messaging().deleteToken();
    } else {
      messaging()
        .getToken()
        .then(token => {
          if (token) {
            setPushToken(token);
            axios.put('/v1/users/fcm/tokens', {
              token,
              platform: Platform.OS.toUpperCase(),
            });
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const renderStack = () => {
    return isLoggedIn
      ? layout === 'user'
        ? DefaultStack()
        : OrganizerStack()
      : AuthStack();
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        isReadyRef.current = true;
      }}>
      {renderStack()}
    </NavigationContainer>
  );
};

export default Navigation;
