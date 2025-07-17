import React, {useState} from 'react';
import {Text, Button, YStack, Image, Input} from 'tamagui';
import {useToastController} from '@tamagui/toast';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm, SubmitHandler, Controller} from 'react-hook-form';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {TextInput} from 'react-native';
import {useMutation} from '@tanstack/react-query';
import {IResponseData} from '../../types';
import {rawAxios} from '../../hooks/useAxios';
import useToast from '../../hooks/useToast';
import {getMessage} from '../../utils';
import LoadingOverlay from '../../components/LoadingOverlay';
import {SCREENS} from '../../navigation';
type ResetPasswordInputs = {
  password: string;
  confirm_password: string;
  otp: string;
};

export default function ResetPasswordScreen() {
  const toast = useToastController();
  const {toastOnError} = useToast();
  const navigation = useNavigation();
  const route = useRoute();
  const {email} = route.params as {email: string};
  const {
    handleSubmit,
    control,
    watch,
    formState: {errors},
  } = useForm<ResetPasswordInputs>();

  const resetPasswordMutation = useMutation({
    mutationFn: (params: {
      email: string;
      newPassword: string;
      signature: string;
    }) =>
      rawAxios.post<IResponseData<unknown>>('/v1/auth/reset-password/otp', {
        username: params.email,
        password: params.newPassword,
        otp: params.signature,
      }),
    onError: toastOnError,
    onSuccess: res => {
      toast.show('Thành công!', {
        message: getMessage(res.data.message) ?? 'Đặt lại mật khẩu thành công',
        customData: {
          theme: 'green',
        },
      });
    },
  });

  const password = watch('password', '');

  const [otpInputRef, setOtpInputRef] = useState<TextInput | null>(null);

  const [confirmPasswordInputRef, setConfirmPasswordInputRef] =
    useState<TextInput | null>(null);

  const onSubmit: SubmitHandler<ResetPasswordInputs> = async data => {
    await resetPasswordMutation.mutateAsync({
      email: email,
      newPassword: data.password,
      signature: data.otp,
    });
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: SCREENS.LOGIN}],
      }),
    );
  };

  return (
    <>
      {resetPasswordMutation.isPending && <LoadingOverlay />}
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
                Cài lại mật khẩu, nhập mật khẩu mới để tiếp tục.
              </Text>
            </YStack>
            <YStack flex={1} width={'100%'} gap={5}>
              <Text fontSize={'$4'} marginTop={4}>
                Mật khẩu
              </Text>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'Mật khẩu không được để trống',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự',
                  },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <Input
                    height={54}
                    theme={errors.password ? 'red' : 'default'}
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      confirmPasswordInputRef?.focus();
                    }}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder={`Nhập mật khẩu của bạn`}
                    secureTextEntry={true}
                    borderRadius={0}
                  />
                )}
              />

              {errors.password && (
                <Text color="$red10" fontSize={'$2'} marginBottom={10}>
                  {errors.password.message}
                </Text>
              )}

              <Text fontSize={'$4'} marginTop={4}>
                Xác nhận mật khẩu
              </Text>
              <Controller
                control={control}
                name="confirm_password"
                rules={{
                  required: 'Mật khẩu không được để trống',
                  validate: value =>
                    value === password || 'Mật khẩu xác nhận không khớp',
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <Input
                    height={54}
                    ref={ref => setConfirmPasswordInputRef(ref)}
                    onSubmitEditing={() => {
                      otpInputRef?.focus();
                    }}
                    theme={errors.confirm_password ? 'red' : 'default'}
                    returnKeyType="next"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder={`Nhập lại mật khẩu của bạn`}
                    secureTextEntry={true}
                    borderRadius={0}
                  />
                )}
              />

              {errors.confirm_password && (
                <Text color="$red10" fontSize={'$2'} marginBottom={10}>
                  {errors.confirm_password.message}
                </Text>
              )}

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
                    ref={ref => setOtpInputRef(ref)}
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
                Cài lại mật khẩu
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
