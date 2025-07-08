import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {isReadyRef, navigationRef} from 'react-navigation-helpers';
import HomeScreen from '../screens/home/HomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import VerifyAccountScreen from '../screens/auth/VerifyAccountScreen';
import useAuthStore from '../store/auth.store';
import TicketsScreen from '../screens/tickets/TicketsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import {Home, Tickets, CircleUserRound} from '@tamagui/lucide-icons';
import EventDetailScreen from '../screens/home/EventDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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
};

const Navigation = () => {
  React.useEffect((): any => {
    return () => (isReadyRef.current = false);
  }, []);

  const renderTabIcon = (
    route: any,
    focused: boolean,
    color: string,
    size: number,
  ) => {
    switch (route.name) {
      case SCREENS.HOME:
        return <Home size={size} color={color} />;
      case SCREENS.TICKETS:
        return <Tickets size={size} color={color} />;
      case SCREENS.SETTINGS:
        return <CircleUserRound size={size} color={color} />;
    }
  };

  const tabNavigation = () => {
    return (
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarActiveTintColor: '#121212',
          tabBarInactiveTintColor: '#757575',
          headerShown: false,
          tabBarIcon: ({focused, color, size}) =>
            renderTabIcon(route, focused, color, size),
        })}>
        <Tab.Screen name={SCREENS.HOME} component={HomeScreen} />
        <Tab.Screen name={SCREENS.TICKETS} component={TicketsScreen} />
        <Tab.Screen name={SCREENS.SETTINGS} component={SettingsScreen} />
      </Tab.Navigator>
    );
  };

  const DefaultStack = () => {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={SCREENS.HOME} component={tabNavigation} />
        <Stack.Screen
          name={SCREENS.EVENT_DETAIL}
          component={EventDetailScreen}
        />
      </Stack.Navigator>
    );
  };

  const AuthStack = () => {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
        <Stack.Screen name={SCREENS.REGISTER} component={RegisterScreen} />
        <Stack.Screen
          name={SCREENS.FORGOT_PASSWORD}
          component={ForgotPasswordScreen}
        />
        <Stack.Screen
          name={SCREENS.RESET_PASSWORD}
          component={ResetPasswordScreen}
        />
        <Stack.Screen
          name={SCREENS.VERIFY_ACCOUNT}
          component={VerifyAccountScreen}
        />
      </Stack.Navigator>
    );
  };

  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  const renderStack = () => {
    return isLoggedIn ? DefaultStack() : AuthStack();
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
