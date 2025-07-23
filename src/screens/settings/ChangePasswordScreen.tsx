import {useNavigation} from '@react-navigation/native';
import {ChevronLeft} from '@tamagui/lucide-icons';
import React, {useState} from 'react';
import {Button, Input, Text, XStack, YStack} from 'tamagui';
import AppBar from '../../components/AppBar';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {TextInput} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useAxios from '../../hooks/useAxios';
import {IResponseData} from '../../types';
import {useMutation} from '@tanstack/react-query';
import useToast from '../../hooks/useToast';
import {getMessage} from '../../utils';
import LoadingOverlay from '../../components/LoadingOverlay';
type ChangePasswordInputs = {
  current_password: string;
  password: string;
  confirm_password: string;
};
export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {toast, toastOnError} = useToast();
  const {
    handleSubmit,
    control,
    watch,
    formState: {errors},
  } = useForm<ChangePasswordInputs>();
  const axios = useAxios();

  const changePasswordMutation = useMutation({
    mutationFn: (params: ChangePasswordInputs) =>
      axios.put<IResponseData<unknown>>('/v1/users/me/change-password', {
        current_password: params.current_password,
        new_password: params.password,
      }),
    onError: toastOnError,
    onSuccess: res => {
      toast.show('Thành công!', {
        message: getMessage(res.data.message) ?? 'Đổi mật khẩu thành công',
        customData: {
          theme: 'green',
        },
      });
      navigation.goBack();
    },
  });

  const password = watch('password', '');

  const [confirmPasswordInputRef, setConfirmPasswordInputRef] =
    useState<TextInput | null>(null);

  const [passwordInputRef, setPasswordInputRef] = useState<TextInput | null>(
    null,
  );

  const onSubmit: SubmitHandler<ChangePasswordInputs> = async data => {
    await changePasswordMutation.mutateAsync(data);
  };
  return (
    <>
      {changePasswordMutation.isPending && <LoadingOverlay />}
      <YStack
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <AppBar>
          <XStack alignItems="center" gap={8}>
            <Button
              backgroundColor={'transparent'}
              variant="outlined"
              themeInverse
              circular
              onPress={() => navigation.goBack()}
              icon={<ChevronLeft size={20} />}
            />
            <Text fontSize={'$7'} fontWeight="bold" color={'white'}>
              Đổi mật khẩu
            </Text>
          </XStack>
        </AppBar>

        <YStack flex={1} width={'100%'} padding={16}>
          <KeyboardAwareScrollView
            enableOnAndroid
            contentContainerStyle={{
              flexGrow: 1,
              width: '100%',
            }}>
            <YStack flex={1} width={'100%'} gap={5}>
              <Text fontSize={'$4'} marginTop={4}>
                Mật khẩu hiện tại
              </Text>
              <Controller
                control={control}
                name="current_password"
                rules={{
                  required: 'Mật khẩu hiện tại không được để trống',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu hiện tại phải có ít nhất 6 ký tự',
                  },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <Input
                    height={54}
                    theme={errors.current_password ? 'red' : 'default'}
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      passwordInputRef?.focus();
                    }}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder={`Nhập mật khẩu hiện tại của bạn`}
                    secureTextEntry={true}
                    borderRadius={0}
                  />
                )}
              />

              {errors.current_password && (
                <Text color="$red10" fontSize={'$2'} marginBottom={10}>
                  {errors.current_password.message}
                </Text>
              )}

              <Text fontSize={'$4'} marginTop={4}>
                Mật khẩu mới
              </Text>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'Mật khẩu mới không được để trống',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
                  },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <Input
                    height={54}
                    ref={ref => setPasswordInputRef(ref)}
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
                    theme={errors.confirm_password ? 'red' : 'default'}
                    returnKeyType="done"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder={`Nhập lại mật khẩu mới của bạn`}
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
            </YStack>
          </KeyboardAwareScrollView>
        </YStack>
        <XStack
          paddingBottom={insets.bottom + 12}
          boxShadow={'$lg'}
          backgroundColor={'white'}
          paddingHorizontal={16}
          paddingTop={12}
          width="100%"
          justifyContent="space-between">
          <XStack gap={4} alignItems="center" flex={1}>
            <Button
              theme={'accent'}
              borderRadius={0}
              onPress={handleSubmit(onSubmit)}
              flex={1}
              height={52}
              paddingHorizontal={24}>
              Cập nhật
            </Button>
          </XStack>
        </XStack>
      </YStack>
    </>
  );
}
