import React from 'react';
import {SCREENS, Stack, Tab} from '.';
import {Home, Tickets, CircleUserRound} from '@tamagui/lucide-icons';
import EventDetailScreen from '../screens/home/EventDetailScreen';
import HomeScreen from '../screens/home/HomeScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import TicketsScreen from '../screens/tickets/TicketsScreen';

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
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={SCREENS.TAB_NAVIGATION} component={TabNavigation} />
      <Stack.Screen name={SCREENS.EVENT_DETAIL} component={EventDetailScreen} />
    </Stack.Navigator>
  );
}
