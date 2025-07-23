import React from 'react';
import {Alert, Platform} from 'react-native';
import {
  Avatar,
  H5,
  ListItem,
  Separator,
  Stack,
  Text,
  XStack,
  YGroup,
  YStack,
} from 'tamagui';
import useAxios from '../../hooks/useAxios';
import {useMutation} from '@tanstack/react-query';
import {IResponseData} from '../../types';
import useToast from '../../hooks/useToast';
import {getMessage, getUserAvatar} from '../../utils';
import useAuthStore from '../../store/auth.store';
import useAppStore from '../../store/app.store';
import LoadingOverlay from '../../components/LoadingOverlay';
import {useNavigation} from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import {
  ChevronRight,
  LockKeyhole,
  LogOut,
  RefreshCw,
  UserCircle,
} from '@tamagui/lucide-icons';
import {SCREENS} from '../../navigation';

export default function SettingsScreen() {
  const axios = useAxios();
  const {toastOnError, toast} = useToast();
  const resetAuthStore = useAuthStore(state => state.reset);
  const user = useAuthStore(state => state.user);
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

        <YStack flex={1} width={'100%'} padding={16} gap="$3">
          <XStack alignItems={'center'} gap="$2" justifyContent="center">
            <Avatar circular size="$5">
              <Avatar.Image
                source={{
                  uri:
                    getUserAvatar(user) ??
                    require('../../assets/placeholder.png'),
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
            <YStack flex={1} gap="$1">
              <H5 lineHeight="$2" color={'gray12'}>
                {user?.first_name} {user?.last_name}
              </H5>
              <Text color={'gray11'}>{user?.email}</Text>
            </YStack>
          </XStack>
          <YGroup
            alignSelf="center"
            bordered
            size="$5"
            separator={<Separator />}>
            <YGroup.Item>
              <ListItem
                onPress={() => {
                  navigation.navigate(SCREENS.UPDATE_USER_INFO);
                }}
                hoverTheme
                theme={'blue'}
                pressTheme
                title="Thông tin cá nhân"
                subTitle="Cập nhật thông tin cá nhân"
                icon={<UserCircle size={20} />}
                iconAfter={ChevronRight}
              />
            </YGroup.Item>
            <YGroup.Item>
              <ListItem
                onPress={() => {
                  navigation.navigate(SCREENS.CHANGE_PASSWORD);
                }}
                hoverTheme
                theme={'blue'}
                pressTheme
                title="Mật khẩu"
                subTitle="Thay đổi mật khẩu"
                icon={<LockKeyhole size={20} />}
                iconAfter={ChevronRight}
              />
            </YGroup.Item>
            <YGroup.Item>
              <ListItem
                onPress={() => {
                  setLayout(layout === 'user' ? 'organizer' : 'user');
                }}
                hoverTheme
                pressTheme
                theme={'blue'}
                title="Đổi giao diện"
                subTitle={`Chuyển sang giao diện cho ${
                  layout === 'user' ? 'ban tổ chức' : 'người dùng'
                }`}
                icon={<RefreshCw size={20} />}
                iconAfter={ChevronRight}
              />
            </YGroup.Item>
            <YGroup.Item>
              <ListItem
                onPress={handleLogout}
                theme={'red'}
                hoverTheme
                pressTheme
                title="Đăng xuất"
                subTitle="Đăng xuất khỏi hệ thống"
                icon={<LogOut size={20} />}
                iconAfter={ChevronRight}
              />
            </YGroup.Item>
          </YGroup>
        </YStack>
      </YStack>
    </>
  );
}
