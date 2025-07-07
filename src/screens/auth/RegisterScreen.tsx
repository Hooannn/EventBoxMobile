import React, {useState} from 'react';
import {Text, Button, YStack, Image, Input, XStack} from 'tamagui';
import {useToastController} from '@tamagui/toast';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm, SubmitHandler, Controller} from 'react-hook-form';
import {TextInput} from 'react-native';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {rawAxios} from '../../hooks/useAxios';
import {IResponseData} from '../../types';
import useToast from '../../hooks/useToast';
import {getMessage} from '../../utils';
import {useMutation} from '@tanstack/react-query';
import LoadingOverlay from '../../components/LoadingOverlay';
type RegisterInputs = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
};

export default function RegisterScreen() {
  const toast = useToastController();
  const navigation = useNavigation();
  const {
    handleSubmit,
    control,
    formState: {errors},
    watch,
  } = useForm<RegisterInputs>();
  const {toastOnError} = useToast();

  const password = watch('password', '');

  const [passwordInputRef, setPasswordInputRef] = useState<TextInput | null>(
    null,
  );

  const [confirmPasswordInputRef, setConfirmPasswordInputRef] =
    useState<TextInput | null>(null);

  const [emailInputRef, setEmailInputRef] = useState<TextInput | null>(null);

  const [lastNameInputRef, setLastNameInputRef] = useState<TextInput | null>(
    null,
  );

  const signUpMutation = useMutation({
    mutationFn: (params: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) =>
      rawAxios.post<IResponseData<boolean>>('/v1/auth/register', {
        username: params.email,
        password: params.password,
        first_name: params.firstName,
        last_name: params.lastName,
      }),
    onError: toastOnError,
    onSuccess: res => {
      toast.show('Thành công!', {
        message: getMessage(res.data.message) ?? 'Đăng ký thành công',
        customData: {
          theme: 'green',
        },
      });
    },
  });

  const onSubmit: SubmitHandler<RegisterInputs> = async data => {
    await signUpMutation.mutateAsync({
      email: data.email,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
    });
    navigation.navigate('VerifyAccount', {
      email: data.email,
    });
  };

  return (
    <>
      {signUpMutation.isPending && <LoadingOverlay />}
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
                Chào mừng bạn đến với EventBox, tạo tài khoản để tiếp tục
              </Text>
            </YStack>
            <YStack flex={1} width={'100%'} gap={5}>
              <XStack width={'100%'} gap={5}>
                <YStack flex={1}>
                  <Text fontSize={'$4'}>Tên</Text>
                  <Controller
                    control={control}
                    name="first_name"
                    rules={{
                      required: 'Tên không được để trống',
                    }}
                    render={({field: {onChange, onBlur, value}}) => (
                      <Input
                        placeholder={`Nhập tên của bạn`}
                        returnKeyType="next"
                        theme={errors.first_name ? 'red' : 'default'}
                        height={54}
                        onSubmitEditing={() => {
                          lastNameInputRef?.focus();
                        }}
                        borderRadius={0}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {errors.first_name && (
                    <Text color="$red10" fontSize={'$2'} marginBottom={10}>
                      {errors.first_name.message}
                    </Text>
                  )}
                </YStack>
                <YStack flex={1}>
                  <Text fontSize={'$4'}>Họ</Text>
                  <Controller
                    control={control}
                    name="last_name"
                    rules={{
                      required: 'Họ không được để trống',
                    }}
                    render={({field: {onChange, onBlur, value}}) => (
                      <Input
                        placeholder={`Nhập họ của bạn`}
                        returnKeyType="next"
                        theme={errors.last_name ? 'red' : 'default'}
                        height={54}
                        ref={ref => setLastNameInputRef(ref)}
                        onSubmitEditing={() => {
                          emailInputRef?.focus();
                        }}
                        borderRadius={0}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {errors.last_name && (
                    <Text color="$red10" fontSize={'$2'} marginBottom={10}>
                      {errors.last_name.message}
                    </Text>
                  )}
                </YStack>
              </XStack>
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
                    returnKeyType="next"
                    ref={ref => setEmailInputRef(ref)}
                    onSubmitEditing={() => {
                      passwordInputRef?.focus();
                    }}
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
                    onBlur={onBlur}
                    onChangeText={onChange}
                    ref={ref => setPasswordInputRef(ref)}
                    onSubmitEditing={() => {
                      confirmPasswordInputRef?.focus();
                    }}
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
                    theme={errors.confirm_password ? 'red' : 'default'}
                    returnKeyType="done"
                    ref={ref => setConfirmPasswordInputRef(ref)}
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
              <Button
                borderRadius={0}
                size={'$3'}
                backgroundColor={'transparent'}
                onPress={() => navigation.navigate('ForgotPassword')}>
                Quên mật khẩu?
              </Button>
            </YStack>
            <YStack flex={1} justifyContent="flex-end" width={'100%'} gap={4}>
              <Button
                theme={'accent'}
                borderRadius={0}
                height={54}
                onPress={handleSubmit(onSubmit)}>
                Đăng ký tài khoản
              </Button>
              <Button
                icon={
                  <Image
                    source={{
                      width: 20,
                      height: 20,
                      uri: require('../../assets/google_icon.png'),
                    }}
                  />
                }
                borderRadius={0}
                height={54}
                onPress={() => toast.show('Đăng nhập thành công!')}>
                Tiếp tục với Google
              </Button>
              <Button
                borderRadius={0}
                size={'$3'}
                backgroundColor={'transparent'}
                onPress={() => {
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{name: 'Login'}],
                    }),
                  );
                }}>
                Đã có tài khoản? Đăng nhập
              </Button>
            </YStack>
          </YStack>
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </>
  );
}
