import React from 'react';
import {Text, Button, YStack, Image, Input} from 'tamagui';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm, SubmitHandler, Controller} from 'react-hook-form';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useMutation} from '@tanstack/react-query';
import {IResponseData, IUser} from '../../types';
import {rawAxios} from '../../hooks/useAxios';
import useToast from '../../hooks/useToast';
import {getMessage} from '../../utils';
import LoadingOverlay from '../../components/LoadingOverlay';
import useAuthStore from '../../store/auth.store';
import {SCREENS} from '../../navigation';
type VerifyInputs = {
  otp: string;
};

export default function VerifyAccountScreen() {
  const {toast, toastOnError} = useToast();
  const navigation = useNavigation();

  const route = useRoute();
  const {email} = route.params as {email: string};
  const {
    handleSubmit,
    control,
    formState: {errors},
  } = useForm<VerifyInputs>();

  const {setAccessToken, setRefreshToken, setLoggedIn, setUser} =
    useAuthStore();

  const verifyAccountMutation = useMutation({
    mutationFn: (params: {email: string; signature: string}) => {
      return rawAxios.post<
        IResponseData<{
          user: IUser;
          access_token: string;
          refresh_token: string;
        }>
      >(`/v1/auth/verify`, {
        username: params.email,
        otp: params.signature,
      });
    },
    onError: toastOnError,
    onSuccess: res => {
      toast.show('Thành công!', {
        message: getMessage(res.data.message) ?? 'Đăng nhập thành công',
        customData: {
          theme: 'green',
        },
      });
      const data = res.data?.data;
      const user = data?.user;
      const accessToken = data?.access_token;
      const refreshToken = data?.refresh_token;
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setLoggedIn(true);
      setUser(user);
    },
  });

  const resendVerifyAccountMutation = useMutation({
    mutationFn: (params: {email: string}) =>
      rawAxios.post<IResponseData<unknown>>('/v1/auth/verify/resend', {
        username: params.email,
      }),
    onError: toastOnError,
    onSuccess: res => {
      toast.show('Thành công!', {
        message: getMessage(res.data.message) ?? 'Yêu cầu đã được gửi',
        customData: {
          theme: 'green',
        },
      });
    },
  });

  const onSubmit: SubmitHandler<VerifyInputs> = data => {
    verifyAccountMutation.mutate({
      email: email,
      signature: data.otp,
    });
  };

  const isLoading =
    resendVerifyAccountMutation.isPending || verifyAccountMutation.isPending;

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <KeyboardAwareScrollView
        enableOnAndroid
        contentContainerStyle={{flexGrow: 1}}>
        <SafeAreaView style={{flex: 1}}>
          <YStack
            flex={1}
            justifyContent="space-between"
            alignItems="center"
            padding="$5">
            <YStack flex={1} justifyContent="flex-start" alignItems="center">
              <Image
                source={{
                  width: 180,
                  height: 180,
                  uri: require('../../assets/auth-icon.png'),
                }}
              />
              <Text fontSize={'$8'} textAlign="center">
                Xác minh tài khoản, nhập mã OTP để tiếp tục.
              </Text>
            </YStack>
            <YStack flex={1} width={'100%'} gap={5}>
              <Text fontSize={'$4'} marginTop={4}>
                Mã xác nhận
              </Text>
              <Controller
                control={control}
                name="otp"
                rules={{
                  required: 'Mã xác nhận không được để trống',
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <Input
                    height={54}
                    theme={errors.otp ? 'red' : 'default'}
                    returnKeyType="done"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder={`Nhập mã xác nhận của bạn`}
                    secureTextEntry={true}
                    borderRadius={0}
                  />
                )}
              />

              {errors.otp && (
                <Text color="$red10" fontSize={'$2'} marginBottom={10}>
                  {errors.otp.message}
                </Text>
              )}
            </YStack>
            <YStack flex={1} justifyContent="flex-end" width={'100%'} gap={4}>
              <Button
                theme={'accent'}
                borderRadius={0}
                height={54}
                onPress={handleSubmit(onSubmit)}>
                Xác nhận
              </Button>
              <Button
                borderRadius={0}
                height={54}
                onPress={() => {
                  resendVerifyAccountMutation.mutate({email: email});
                }}>
                Gửi lại mã xác nhận
              </Button>
              <Button
                borderRadius={0}
                size={'$3'}
                backgroundColor={'transparent'}
                onPress={() => {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{name: SCREENS.LOGIN}],
                    }),
                  );
                }}>
                Đã xong? Quay lại đăng nhập
              </Button>
            </YStack>
          </YStack>
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </>
  );
}
