import React from 'react';
import {Text, Button, YStack, Image, Input} from 'tamagui';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm, SubmitHandler, Controller} from 'react-hook-form';
import {useNavigation} from '@react-navigation/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useMutation} from '@tanstack/react-query';
import {rawAxios} from '../../hooks/useAxios';
import {IResponseData} from '../../types';
import useToast from '../../hooks/useToast';
import {getMessage} from '../../utils';
import LoadingOverlay from '../../components/LoadingOverlay';
import {SCREENS} from '../../navigation';
type ForgotPasswordInputs = {
  email: string;
};

export default function ForgotPasswordScreen() {
  const {toast, toastOnError} = useToast();
  const navigation = useNavigation();
  const {
    handleSubmit,
    control,
    formState: {errors},
  } = useForm<ForgotPasswordInputs>();

  const forgotPasswordMutation = useMutation({
    mutationFn: (params: {email: string}) =>
      rawAxios.post<IResponseData<unknown>>('/v1/auth/forgot-password/otp', {
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

  const onSubmit: SubmitHandler<ForgotPasswordInputs> = async data => {
    await forgotPasswordMutation.mutateAsync(data);
    navigation.navigate(SCREENS.RESET_PASSWORD, {
      email: data.email,
    });
  };

  return (
    <>
      {forgotPasswordMutation.isPending && <LoadingOverlay />}
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
                Quên mật khẩu, nhập email của bạn để tiếp tục.
              </Text>
            </YStack>
            <YStack flex={1} width={'100%'} gap={5}>
              <Text fontSize={'$4'}>Email</Text>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Email không được để trống',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: 'Email không hợp lệ',
                  },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <Input
                    placeholder={`Nhập email của bạn`}
                    returnKeyType="done"
                    theme={errors.email ? 'red' : 'default'}
                    height={54}
                    borderRadius={0}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />

              {errors.email && (
                <Text color="$red10" fontSize={'$2'} marginBottom={10}>
                  {errors.email.message}
                </Text>
              )}
            </YStack>
            <YStack flex={1} justifyContent="flex-end" width={'100%'} gap={4}>
              <Button
                theme={'accent'}
                borderRadius={0}
                height={54}
                onPress={handleSubmit(onSubmit)}>
                Gửi yêu cầu
              </Button>
              <Button
                borderRadius={0}
                height={54}
                onPress={() => navigation.goBack()}>
                Quay lại
              </Button>
            </YStack>
          </YStack>
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </>
  );
}
