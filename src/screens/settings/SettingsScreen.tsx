import React from 'react';
import {Alert, Platform} from 'react-native';
import {Button, Stack, Text, View, YStack} from 'tamagui';
import useAxios from '../../hooks/useAxios';
import {useMutation} from '@tanstack/react-query';
import {IResponseData} from '../../types';
import useToast from '../../hooks/useToast';
import {getMessage} from '../../utils';
import useAuthStore from '../../store/auth.store';
import useAppStore from '../../store/app.store';
import LoadingOverlay from '../../components/LoadingOverlay';
import {useNavigation} from '@react-navigation/native';
import AppBar from '../../components/AppBar';

export default function SettingsScreen() {
  const axios = useAxios();
  const {toastOnError, toast} = useToast();
  const resetAuthStore = useAuthStore(state => state.reset);
  const setLayout = useAppStore(state => state.setLayout);
  const layout = useAppStore(state => state.layout);
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
      <YStack style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <AppBar>
          <Stack
            paddingTop={8}
            paddingBottom={8}
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            flex={1}>
            <Text color={'white'} fontWeight={700} fontSize={'$7'}>
              Tài khoản
            </Text>
          </Stack>
        </AppBar>

        <YStack
          flex={1}
          width={'100%'}
          alignItems="center"
          justifyContent="center">
          <View flex={1} justifyContent="center" alignItems="center">
            <Button onPress={handleLogout}>Logout</Button>

            <Button
              onPress={() => {
                navigation.navigate('PaymentProcessing', {
                  orderId: 12345,
                });
              }}>
              Processing
            </Button>

            <Button
              onPress={() => {
                setLayout(layout === 'user' ? 'organizer' : 'user');
              }}>
              Switch layout (current: {layout})
            </Button>
          </View>
        </YStack>
      </YStack>
    </>
  );
}
