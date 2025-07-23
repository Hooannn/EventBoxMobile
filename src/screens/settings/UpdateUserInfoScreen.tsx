import {ChevronLeft, Edit3, X} from '@tamagui/lucide-icons';
import React, {useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  Avatar,
  Button,
  Circle,
  Input,
  Stack,
  Text,
  XStack,
  YStack,
} from 'tamagui';
import AppBar from '../../components/AppBar';
import {useNavigation} from '@react-navigation/native';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useToast from '../../hooks/useToast';
import useAxios from '../../hooks/useAxios';
import {useMutation} from '@tanstack/react-query';
import {IResponseData, IUser} from '../../types';
import {getMessage, getUserAvatar} from '../../utils';
import {TextInput} from 'react-native';
import useAuthStore from '../../store/auth.store';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import LoadingOverlay from '../../components/LoadingOverlay';

type UpdateInformationInputs = {
  first_name: string;
  last_name: string;
  avatar_base64?: string;
  remove_avatar: boolean;
};

export default function UpdateUserInfoScreen() {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  const insets = useSafeAreaInsets();
  const {toast, toastOnError} = useToast();
  const {
    handleSubmit,
    control,
    formState: {errors},
  } = useForm<UpdateInformationInputs>({
    defaultValues: {
      first_name: user!.first_name,
      last_name: user!.last_name,
      avatar_base64: '',
      remove_avatar: false,
    },
  });
  const axios = useAxios();

  const updateMutation = useMutation({
    mutationFn: (params: UpdateInformationInputs) =>
      axios.put<IResponseData<unknown>>('/v1/users/me/update', params),
    onError: toastOnError,
    onSuccess: async res => {
      toast.show('Thành công!', {
        message:
          getMessage(res.data.message) ?? 'Cập nhật thông tin thành công',
        customData: {
          theme: 'green',
        },
      });
      const userRes = await getUserInfoMutation.mutateAsync();
      useAuthStore.setState({user: userRes.data.data});
      navigation.goBack();
    },
  });

  const getUserInfoMutation = useMutation({
    mutationFn: () => axios.get<IResponseData<IUser>>('/v1/users/me'),
    onError: toastOnError,
  });

  const [firstNameInputRef, setFirstNameInputRef] = useState<TextInput | null>(
    null,
  );

  const onSubmit: SubmitHandler<UpdateInformationInputs> = async data => {
    if (currentSelectedAsset) {
      data.avatar_base64 = toDataUri(
        currentSelectedAsset.base64 ?? '',
        currentSelectedAsset.type ?? 'image/png',
      );
      data.remove_avatar = false;
    } else {
      if (getUserAvatar(user) && avatar === '') {
        data.remove_avatar = true;
      }
    }

    await updateMutation.mutateAsync(data);
  };

  const toDataUri = (base64: string, mimeType: string) => {
    return `data:${mimeType};base64,${base64}`;
  };

  const handleImagePicker = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      selectionLimit: 1,
      quality: 0.8,
    });

    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return;
    }
    const asset = result.assets[0];
    setCurrentSelectedAsset(asset);
  };

  const [avatar, setAvatar] = useState<string>(getUserAvatar(user) ?? '');

  const [currentSelectedAsset, setCurrentSelectedAsset] =
    useState<Asset | null>(null);

  const getDisplayAvatar = () => {
    if (currentSelectedAsset) {
      return currentSelectedAsset.uri;
    }

    return avatar;
  };

  const isLoading = updateMutation.isPending || getUserInfoMutation.isPending;

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <YStack style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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
              Cập nhật thông tin
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
              <Stack
                position="relative"
                width={'$8'}
                marginHorizontal={'auto'}
                onPress={handleImagePicker}>
                {getDisplayAvatar()?.length && (
                  <Circle
                    position="absolute"
                    top={0}
                    onPress={() => {
                      setCurrentSelectedAsset(null);
                      setAvatar('');
                    }}
                    right={0}
                    zIndex={1}
                    backgroundColor={'red'}
                    width={24}
                    height={24}
                    borderRadius={24}>
                    <X color={'white'} size={10} />
                  </Circle>
                )}

                <Circle
                  position="absolute"
                  bottom={4}
                  right={4}
                  zIndex={1}
                  backgroundColor={'gray'}
                  width={20}
                  height={20}
                  borderRadius={20}>
                  <Edit3 color={'white'} size={10} />
                </Circle>
                <Avatar circular size="$8">
                  <Avatar.Image
                    source={{
                      uri: getDisplayAvatar()?.length
                        ? getDisplayAvatar()
                        : require('../../assets/placeholder.png'),
                    }}
                  />
                  <Avatar.Fallback>
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      flex={1}
                      width={'100%'}
                      height={'100%'}
                      backgroundColor={'lightgray'}>
                      <Text>
                        {user?.first_name?.charAt(0).toUpperCase() ||
                          user?.last_name?.charAt(0).toUpperCase() ||
                          '?'}
                      </Text>
                    </Stack>
                  </Avatar.Fallback>
                </Avatar>
              </Stack>
              <Text fontSize={'$4'} marginTop={4}>
                Họ
              </Text>
              <Controller
                control={control}
                name="last_name"
                rules={{
                  required: 'Họ không được để trống',
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <Input
                    height={54}
                    theme={errors.last_name ? 'red' : 'default'}
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      firstNameInputRef?.focus();
                    }}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder={`Nhập họ của bạn`}
                    borderRadius={0}
                  />
                )}
              />

              {errors.last_name && (
                <Text color="$red10" fontSize={'$2'} marginBottom={10}>
                  {errors.last_name.message}
                </Text>
              )}

              <Text fontSize={'$4'} marginTop={4}>
                Tên
              </Text>
              <Controller
                control={control}
                name="first_name"
                rules={{
                  required: 'Tên không được để trống',
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <Input
                    height={54}
                    ref={ref => setFirstNameInputRef(ref)}
                    theme={errors.first_name ? 'red' : 'default'}
                    returnKeyType="done"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder={`Nhập tên của bạn`}
                    borderRadius={0}
                  />
                )}
              />

              {errors.first_name && (
                <Text color="$red10" fontSize={'$2'} marginBottom={10}>
                  {errors.first_name.message}
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
