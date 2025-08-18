import React from 'react';
import {SCREENS, Stack, Tab} from '.';
import {Home, Tickets, CircleUserRound} from '@tamagui/lucide-icons';
import EventDetailScreen from '../screens/home/EventDetailScreen';
import HomeScreen from '../screens/home/HomeScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import TicketsScreen from '../screens/tickets/TicketsScreen';
import CheckOutScreen from '../screens/home/CheckOutScreen';
import PaymentScreen from '../screens/home/PaymentScreen';
import PaymentProcessingScreen from '../screens/home/PaymentProcessingScreen';
import PaymentSuccessScreen from '../screens/home/PaymentSuccess';
import {useRoute} from '@react-navigation/native';
import TicketItemDetailScreen from '../screens/tickets/TicketItemDetailScreen';
import SearchScreen from '../screens/home/SearchScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import UpdateUserInfoScreen from '../screens/settings/UpdateUserInfoScreen';
import FeedbackScreen from '../screens/tickets/FeedbackScreen';

export default function DefaultStack() {
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

  const TabNavigation = () => {
    const route = useRoute();
    const initialTab = route.params?.initialTab || SCREENS.HOME;
    return (
      <Tab.Navigator
        initialRouteName={initialTab}
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
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={SCREENS.TAB_NAVIGATION} component={TabNavigation} />
      <Stack.Screen name={SCREENS.SEARCH} component={SearchScreen} />
      <Stack.Screen name={SCREENS.EVENT_DETAIL} component={EventDetailScreen} />
      <Stack.Screen name={SCREENS.CHECK_OUT} component={CheckOutScreen} />
      <Stack.Screen name={SCREENS.PAYMENT} component={PaymentScreen} />
      <Stack.Screen
        name={SCREENS.PAYMENT_PROCESSING}
        component={PaymentProcessingScreen}
      />
      <Stack.Screen
        name={SCREENS.PAYMENT_SUCCESS}
        component={PaymentSuccessScreen}
      />
      <Stack.Screen
        name={SCREENS.TICKET_ITEM_DETAIL}
        component={TicketItemDetailScreen}
      />
      <Stack.Screen
        name={SCREENS.CHANGE_PASSWORD}
        component={ChangePasswordScreen}
      />
      <Stack.Screen
        name={SCREENS.UPDATE_USER_INFO}
        component={UpdateUserInfoScreen}
      />
      <Stack.Screen name={SCREENS.FEEDBACK} component={FeedbackScreen} />
    </Stack.Navigator>
  );
}
