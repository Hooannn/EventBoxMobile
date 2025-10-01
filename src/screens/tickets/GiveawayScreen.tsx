import {ChevronLeft, MessageSquareWarning} from '@tamagui/lucide-icons';
import React, {useState} from 'react';
import {Button, Card, Input, Stack, Text, XStack, YStack} from 'tamagui';
import AppBar from '../../components/AppBar';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import useAxios from '../../hooks/useAxios';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import useToast from '../../hooks/useToast';
import {useMutation} from '@tanstack/react-query';
import {IResponseData} from '../../types';
import {getMessage} from '../../utils';
import LoadingOverlay from '../../components/LoadingOverlay';
import {SCREENS} from '../../navigation';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {TextInput} from 'react-native';

type GiveawayInputs = {
  recipient_email: string;
  password: string;
};

export default function GiveawayScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const {
    handleSubmit,
    control,
    formState: {errors},
  } = useForm<GiveawayInputs>();
  const {toast, toastOnError} = useToast();
  const [passwordInputRef, setPasswordInputRef] = useState<TextInput | null>(
    null,
  );
  const axios = useAxios();

  const {ticketItemId} = route.params as {
    ticketItemId: number;
  };

  const giveawayMutation = useMutation({
    mutationFn: (params: {password: string; recipient_email: string}) =>
      axios.post<IResponseData<boolean>>(
        `/v1/tickets/items/${ticketItemId}/giveaway`,
        {
          password: params.password,
          recipient_email: params.recipient_email,
        },
      ),
    onError: toastOnError,
    onSuccess: res => {
      toast.show('Thành công!', {
        message: getMessage(res.data.message) ?? 'Thao tác thành công',
        customData: {
          theme: 'green',
        },
      });
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: SCREENS.TAB_NAVIGATION,
              params: {initialTab: SCREENS.TICKETS},
            },
          ],
        }),
      );
    },
  });

  const onSubmit: SubmitHandler<GiveawayInputs> = data => {
    giveawayMutation.mutate(data);
  };
  return (
    <>
      {giveawayMutation.isPending && <LoadingOverlay />}
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
              Chuyển nhượng vé
            </Text>
          </XStack>
        </AppBar>

        <Stack flex={1} width={'100%'}>
          <KeyboardAwareScrollView
            enableOnAndroid
            contentContainerStyle={{
              flexGrow: 1,
              width: '100%',
            }}>
            <YStack flex={1} width={'100%'} padding={16} gap={16}>
              <Card
                borderRadius={0}
                padding={16}
                gap={12}
                theme={'yellow'}
                bordered>
                <XStack alignItems="center" gap={8} width={'100%'} flex={1}>
                  <MessageSquareWarning color={'$yellow11'} size={'$2'} />
                  <YStack width={'90%'} gap={2}>
                    <Text color={'$yellow11'}>
                      Khi chuyển nhượng vé, bạn không thể hoàn tác. Vé sẽ được
                      chuyển sang tài khoản người nhận và bạn sẽ không thể sử
                      dụng vé này nữa.
                    </Text>
                    <Text color={'$yellow11'}>
                      Vì lí do bảo mật, bạn cần nhập mật khẩu tài khoản để xác
                      nhận.
                    </Text>
                  </YStack>
                </XStack>
              </Card>

              <YStack flex={1} width={'100%'} gap={5}>
                <Text fontSize={'$4'}>Email người nhận</Text>
                <Controller
                  control={control}
                  name="recipient_email"
                  rules={{
                    required: 'Email không được để trống',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                      message: 'Email không hợp lệ',
                    },
                  }}
                  render={({field: {onChange, onBlur, value}}) => (
                    <Input
                      placeholder={`Nhập email của người nhận`}
                      returnKeyType="next"
                      theme={errors.recipient_email ? 'red' : 'default'}
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

                {errors.recipient_email && (
                  <Text color="$red10" fontSize={'$2'} marginBottom={10}>
                    {errors.recipient_email.message}
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
              </YStack>
            </YStack>
          </KeyboardAwareScrollView>
        </Stack>

        <XStack
          paddingBottom={insets.bottom + 12}
          boxShadow={'$lg'}
          backgroundColor={'white'}
          paddingHorizontal={16}
          paddingTop={12}
          width="100%"
          justifyContent="space-between">
          <Button
            theme={'yellow'}
            borderRadius={0}
            themeInverse
            flex={1}
            height={52}
            onPress={handleSubmit(onSubmit)}
            paddingHorizontal={24}>
            Xác nhận
          </Button>
        </XStack>
      </YStack>
    </>
  );
}
