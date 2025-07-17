import React, {useState} from 'react';
import {Alert, Platform} from 'react-native';
import {Button, View} from 'tamagui';
import useAxios from '../../hooks/useAxios';
import {useMutation} from '@tanstack/react-query';
import {IResponseData} from '../../types';
import useToast from '../../hooks/useToast';
import {getMessage} from '../../utils';
import useAuthStore from '../../store/auth.store';
import useAppStore from '../../store/app.store';
import LoadingOverlay from '../../components/LoadingOverlay';
import {useNavigation} from '@react-navigation/native';

export default function SettingsScreen() {
  const axios = useAxios();
  const {toastOnError, toast} = useToast();
  const resetAuthStore = useAuthStore(state => state.reset);
  const resetAppStore = useAppStore(state => state.reset);
  const navigation = useNavigation();

  const logoutMutation = useMutation({
    mutationFn: () =>
      axios.post<IResponseData<boolean>>('/v1/auth/logout', {
        platform: Platform.OS.toUpperCase(),
      }),
    onError: toastOnError,
    onSuccess: res => {
      toast.show('Thành công!', {
        message: getMessage(res.data.message) ?? 'Đăng xuất thành công',
        customData: {
          theme: 'green',
        },
      });
    },
  });

  const logout = async () => {
    logoutMutation.mutateAsync().finally(() => {
      resetAuthStore();
      resetAppStore();
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        {
          text: 'Huỷ',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: logout,
        },
      ],
      {cancelable: true},
    );
  };
  return (
    <>
      {logoutMutation.isPending && <LoadingOverlay />}
      <View flex={1} justifyContent="center" alignItems="center">
        <Button onPress={handleLogout}>Logout</Button>
        <Button
          onPress={() => {
            axios.get('/v1/events/test/notification');
          }}>
          test noti
        </Button>
        <Button
          onPress={() => {
            navigation.navigate('PaymentProcessing', {
              orderId: '12345',
            });
          }}>
          Socket
        </Button>

        <Button
          onPress={() => {
            navigation.navigate('PaymentSuccess', {
              orderId: '12345',
            });
          }}>
          Success
        </Button>
      </View>
    </>
  );
}
