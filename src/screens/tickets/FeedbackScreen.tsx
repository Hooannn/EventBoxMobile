import {ChevronLeft} from '@tamagui/lucide-icons';
import React, {useState} from 'react';
import {Button, Stack, Text, TextArea, XStack, YStack} from 'tamagui';
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
export default function FeedbackScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const [feedback, setFeedback] = useState<string>('');
  const {toast, toastOnError} = useToast();
  const axios = useAxios();

  const {ticketItemId} = route.params as {
    ticketItemId: number;
  };

  const feedbackMutation = useMutation({
    mutationFn: (params: {feedback: string}) =>
      axios.post<IResponseData<boolean>>(
        `/v1/tickets/items/${ticketItemId}/feedback`,
        {
          feedback: params.feedback,
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

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) {
      toast?.show('Vui lòng nhập phản hồi của bạn', {
        native: false,
        customData: {
          theme: 'yellow',
        },
      });
      return;
    }

    feedbackMutation.mutate({feedback: feedback.trim()});
  };

  return (
    <>
      {feedbackMutation.isPending && <LoadingOverlay />}
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
              Gửi phản hồi
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
            <YStack flex={1} width={'100%'} padding={16}>
              <TextArea
                value={feedback}
                size="$4"
                borderRadius="$0"
                rows={6}
                onChangeText={setFeedback}
                placeholder="Gửi phản hồi của bạn..."
                maxLength={200}
              />
              <Text
                fontSize={'$2'}
                color={'$color'}
                marginTop={8}
                textAlign="right">
                {feedback.length}/200
              </Text>
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
            onPress={handleSubmitFeedback}
            flex={1}
            height={52}
            paddingHorizontal={24}>
            Xác nhận
          </Button>
        </XStack>
      </YStack>
    </>
  );
}
