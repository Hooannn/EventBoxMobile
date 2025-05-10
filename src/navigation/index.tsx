import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {isReadyRef, navigationRef} from 'react-navigation-helpers';
import Icon, {IconType} from 'react-native-dynamic-vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export const SCREENS = {
  HOME: 'Home',
  SEARCH: 'Search',
  NOTIFICATION: 'Notification',
  PROFILE: 'Profile',
  DETAIL: 'Detail',
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
    let iconName = 'home';
    switch (route.name) {
      case SCREENS.HOME:
        iconName = focused ? 'home' : 'home-outline';
        break;
      case SCREENS.SEARCH:
        iconName = focused ? 'search' : 'search-outline';
        break;
      case SCREENS.NOTIFICATION:
        iconName = focused ? 'notifications' : 'notifications-outline';
        break;
      case SCREENS.PROFILE:
        iconName = focused ? 'person' : 'person-outline';
        break;
      default:
        iconName = focused ? 'home' : 'home-outline';
        break;
    }
    return (
      <Icon
        name={iconName}
        type={IconType.Ionicons}
        size={size}
        color={color}
      />
    );
  };

  const tabNavigation = () => {
    return (
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarIcon: ({focused, color, size}) =>
            renderTabIcon(route, focused, color, size),
        })}>
        <Tab.Screen name={SCREENS.HOME} component={HomeScreen} />
        <Tab.Screen name={SCREENS.SEARCH} component={SearchScreen} />
      </Tab.Navigator>
    );
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        isReadyRef.current = true;
      }}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={SCREENS.HOME} component={tabNavigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
