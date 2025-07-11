import React from 'react';
import {SCREENS, Stack} from '.';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import VerifyAccountScreen from '../screens/auth/VerifyAccountScreen';

export default function AuthStack() {
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
}
