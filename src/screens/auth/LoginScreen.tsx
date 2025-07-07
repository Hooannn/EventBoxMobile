import React, {useState} from 'react';
import {Text, Button, YStack, Image, Input} from 'tamagui';
import {useToastController} from '@tamagui/toast';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useForm, SubmitHandler, Controller} from 'react-hook-form';
import {TextInput} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {rawAxios} from '../../hooks/useAxios';
import {IResponseData, IUser} from '../../types';
import {useMutation} from '@tanstack/react-query';
import useToast from '../../hooks/useToast';
import useAuthStore from '../../store/auth.store';
import {getMessage} from '../../utils';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import LoadingOverlay from '../../components/LoadingOverlay';
type LoginInputs = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const toast = useToastController();
  const navigation = useNavigation();
  const {
    handleSubmit,
    control,
    formState: {errors},
  } = useForm<LoginInputs>();

  const {toastOnError} = useToast();

  const {setAccessToken, setRefreshToken, setLoggedIn, setUser} =
    useAuthStore();

  const [passwordInputRef, setPasswordInputRef] = useState<TextInput | null>(
    null,
  );

  const signInMutation = useMutation({
    mutationFn: (params: {email: string; password: string}) => {
      return rawAxios.post<
        IResponseData<{
          user: IUser;
          access_token: string;
          refresh_token: string;
        }>
      >('v1/auth/login', {
        username: params.email,
        password: params.password,
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

  const onSubmit: SubmitHandler<LoginInputs> = data => {
    signInMutation.mutate(data);
  };

  return (
    <>
      {signInMutation.isPending && <LoadingOverlay />}
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
                Chào mừng bạn đến với EventBox, đăng nhập để tiếp tục
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
                    returnKeyType="next"
                    theme={errors.email ? 'red' : 'default'}
                    height={54}
                    onSubmitEditing={() => {
                      passwordInputRef?.focus();
                    }}
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
                    ref={ref => {
                      setPasswordInputRef(ref);
                    }}
                    theme={errors.password ? 'red' : 'default'}
                    returnKeyType="done"
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
                Đăng nhập
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
                onPress={() => navigation.navigate('Register')}>
                Chưa có tài khoản? Đăng ký ngay
              </Button>
            </YStack>
          </YStack>
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </>
  );
}
