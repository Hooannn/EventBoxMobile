import React from 'react';
import {
  Button,
  Card,
  Image,
  ScrollView,
  Separator,
  Spinner,
  Stack,
  Text,
  View,
  XStack,
  YStack,
} from 'tamagui';
import AppBar from '../../components/AppBar';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AlertTriangle, ChevronLeft} from '@tamagui/lucide-icons';
import useAxios from '../../hooks/useAxios';
import {useMutation} from '@tanstack/react-query';
import {IEvent, IResponseData, ITicketItemDetail} from '../../types';
import dayjs from '../../libs/dayjs';
import {getEventLogo, getMessage, stringToDateFormatV2} from '../../utils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LoadingOverlay from '../../components/LoadingOverlay';
import useToast from '../../hooks/useToast';

export default function ScanTicketResultScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const axios = useAxios();
  const route = useRoute();
  const {toast} = useToast();
  const {token, eventShowId} = route.params as {
    token: string;
    eventShowId: number;
  };

  const createTraceMutation = useMutation({
    mutationFn: (params: {token: string; eventShowId: number}) =>
      axios.post<IResponseData<ITicketItemDetail>>('/v1/tickets/traces', {
        token: params.token,
        event_show_id: params.eventShowId,
      }),
    onError: () => {
      toast?.show('Có lỗi xảy ra!', {
        message: 'Không thể thực hiện thao tác này. Vui lòng thử lại sau.',
        native: false,
        customData: {
          theme: 'red',
        },
      });
      navigation.goBack();
    },
    onSuccess: res => {
      toast.show('Thành công!', {
        message: getMessage(res.data.message) ?? 'Thao tác thành công',
        customData: {
          theme: 'green',
        },
      });
      navigation.goBack();
    },
  });

  const validateTicketMutation = useMutation({
    mutationFn: (params: {token: string; eventShowId: number}) =>
      axios.post<IResponseData<ITicketItemDetail>>('/v1/tickets/validate', {
        token: params.token,
        event_show_id: params.eventShowId,
      }),
  });

  const ticketItem = validateTicketMutation.data?.data?.data;

  React.useEffect(() => {
    validateTicketMutation.mutate({token, eventShowId});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, eventShowId]);

  const doAction = () => {
    createTraceMutation.mutate({
      token: token,
      eventShowId: eventShowId,
    });
  };

  const getActionButton = () => {
    const traces = ticketItem?.traces || [];
    if (traces.length === 0)
      return (
        <Button
          theme={'accent'}
          onPress={doAction}
          borderRadius={0}
          flex={1}
          height={52}
          paddingHorizontal={24}>
          Check-in
        </Button>
      );

    const lastTrace = traces[traces.length - 1];
    const lastEvent = lastTrace.event;

    if (lastEvent === 'CHECKED_IN') {
      return (
        <Button
          theme={'accent'}
          borderRadius={0}
          flex={1}
          onPress={doAction}
          height={52}
          paddingHorizontal={24}>
          Đi ra ngoài
        </Button>
      );
    } else {
      return (
        <Button
          theme={'accent'}
          borderRadius={0}
          flex={1}
          onPress={doAction}
          height={52}
          paddingHorizontal={24}>
          Check-in
        </Button>
      );
    }
  };
  return (
    <>
      {createTraceMutation.isPending && <LoadingOverlay />}
      <YStack flex={1} justifyContent="center" alignItems="center">
        <AppBar>
          <XStack alignItems="center" gap={8} width={'100%'}>
            <Button
              backgroundColor={'transparent'}
              variant="outlined"
              themeInverse
              circular
              onPress={() => navigation.goBack()}
              icon={<ChevronLeft size={20} />}
            />
            <YStack flex={1} width={'88%'}>
              <Text
                fontSize={'$7'}
                fontWeight="bold"
                color={'white'}
                width={'100%'}
                ellipsizeMode="tail"
                numberOfLines={1}>
                Thông tin vé
              </Text>
            </YStack>
          </XStack>
        </AppBar>

        {validateTicketMutation.isPending ||
        validateTicketMutation.isPaused ||
        validateTicketMutation.isIdle ? (
          <YStack
            flex={1}
            width={'100%'}
            alignItems="center"
            justifyContent="center">
            <Spinner />
          </YStack>
        ) : (
          <>
            {validateTicketMutation.isError || !ticketItem ? (
              <YStack
                flex={1}
                width={'100%'}
                alignItems="center"
                justifyContent="center">
                <AlertTriangle size={100} color="gray" opacity={0.7} />
                <Text>Vé không hợp lệ hoặc đã hết hạn.</Text>
                <Text>Vui lòng thử lại.</Text>
                <Button
                  marginTop={16}
                  borderRadius={0}
                  theme={'accent'}
                  onPress={() => {
                    navigation.goBack();
                  }}>
                  Quay lại
                </Button>
              </YStack>
            ) : (
              <>
                <ScrollView flexGrow={1} width={'100%'}>
                  <YStack flex={1} width={'100%'} padding={16} gap={12}>
                    <Card bordered backgroundColor={'white'} height={450}>
                      <Card
                        bordered
                        borderLeftWidth={0}
                        borderTopWidth={0}
                        borderBottomWidth={0}
                        style={{
                          position: 'absolute',
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: '#f2f2f2',
                          left: -10,
                          top: '50%',
                          marginTop: -10,
                          zIndex: 10,
                        }}
                      />
                      <Card
                        bordered
                        borderRightWidth={0}
                        borderTopWidth={0}
                        borderBottomWidth={0}
                        style={{
                          position: 'absolute',
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: '#f2f2f2',
                          right: -10,
                          top: '50%',
                          marginTop: -10,
                          zIndex: 10,
                        }}
                      />
                      <YStack flex={1}>
                        <Stack
                          height={'50%'}
                          paddingVertical={24}
                          paddingHorizontal={24}
                          gap={4}
                          flexDirection="column">
                          <Image
                            borderRadius={8}
                            resizeMode="cover"
                            width={'100%'}
                            height={'80%'}
                            source={{
                              uri: getEventLogo(
                                ticketItem.ticket.event_show.event as IEvent,
                              ),
                            }}
                          />

                          <Stack
                            flexDirection="column"
                            justifyContent="center"
                            alignItems="center">
                            <Text
                              fontWeight={800}
                              textAlign="center"
                              fontSize={'$6'}>
                              {ticketItem.ticket.event_show.event.title}
                            </Text>
                          </Stack>
                        </Stack>
                        <View
                          flexDirection="row"
                          justifyContent="space-between"
                          marginHorizontal={16}>
                          {Array.from({length: 20}).map((_, i) => (
                            <View
                              key={'Dashed' + i}
                              width={10}
                              height={1}
                              backgroundColor="grey"
                              marginRight={2}
                            />
                          ))}
                        </View>
                        <Stack
                          height={'50%'}
                          alignItems="center"
                          paddingHorizontal={24}
                          paddingVertical={24}
                          justifyContent="center">
                          <YStack
                            flex={1}
                            width={'100%'}
                            justifyContent="center"
                            gap={8}>
                            <XStack justifyContent="space-between" gap={16}>
                              <YStack width={'50%'}>
                                <Text fontSize={'$3'}>Địa điểm</Text>
                                <Text fontWeight={700} fontSize={'$3'}>
                                  {
                                    ticketItem.ticket.event_show.event
                                      .place_name
                                  }
                                </Text>
                              </YStack>
                              <YStack width={'50%'}>
                                <Text fontSize={'$3'}>Địa chỉ</Text>
                                <Text fontWeight={700} fontSize={'$3'}>
                                  {ticketItem.ticket.event_show.event.address}
                                </Text>
                              </YStack>
                            </XStack>
                            <XStack justifyContent="space-between" gap={16}>
                              <YStack width={'50%'}>
                                <Text fontSize={'$3'}>Loại vé</Text>
                                <Text fontWeight={700} fontSize={'$3'}>
                                  {ticketItem.ticket.name}
                                </Text>
                              </YStack>
                              <YStack width={'50%'}>
                                <Text fontSize={'$3'}>Thời gian diễn ra</Text>
                                <Text fontWeight={700} fontSize={'$3'}>
                                  Từ{' '}
                                  {stringToDateFormatV2(
                                    ticketItem.ticket.event_show.start_time,
                                  )}
                                </Text>
                                <Text fontWeight={700} fontSize={'$3'}>
                                  đến{' '}
                                  {stringToDateFormatV2(
                                    ticketItem.ticket.event_show.end_time,
                                  )}
                                </Text>
                              </YStack>
                            </XStack>
                          </YStack>
                        </Stack>
                      </YStack>
                    </Card>

                    <Card
                      bordered
                      backgroundColor={'white'}
                      padding={16}
                      gap={12}>
                      <Text fontSize={'$6'} fontWeight={'700'}>
                        Hoạt động
                      </Text>
                      <Separator />
                      <YStack>
                        {ticketItem.traces && ticketItem.traces.length > 0 ? (
                          <>
                            {ticketItem.traces.map(trace => (
                              <XStack
                                key={'Trace' + trace.id}
                                justifyContent="space-between"
                                alignItems="center"
                                paddingVertical={8}>
                                <YStack>
                                  <Text fontSize={'$3'}>
                                    {trace.event === 'CHECKED_IN'
                                      ? 'Đã check-in'
                                      : 'Đã ra ngoài'}
                                  </Text>
                                  <Text fontSize={'$2'} color={'gray'}>
                                    {dayjs(trace.created_at).format(
                                      'DD/MM/YYYY, HH:mm',
                                    )}
                                  </Text>
                                </YStack>
                                <YStack alignItems="flex-end">
                                  <Text fontSize={'$2'} color={'gray'}>
                                    Người thực hiện
                                  </Text>
                                  <Text fontSize={'$2'} color={'gray'}>
                                    {trace.issuer.first_name}{' '}
                                    {trace.issuer.last_name}
                                  </Text>
                                </YStack>
                              </XStack>
                            ))}
                          </>
                        ) : (
                          <>
                            <Text
                              fontSize={'$3'}
                              color={'gray'}
                              textAlign="center">
                              Vé chưa được sử dụng
                            </Text>
                          </>
                        )}
                      </YStack>
                    </Card>
                  </YStack>
                </ScrollView>
                <XStack
                  paddingBottom={insets.bottom + 12}
                  boxShadow={'$lg'}
                  backgroundColor={'white'}
                  paddingHorizontal={16}
                  paddingTop={12}
                  width="100%"
                  justifyContent="space-between">
                  <XStack gap={4} alignItems="center" flex={1}>
                    {getActionButton()}
                  </XStack>
                </XStack>
              </>
            )}
          </>
        )}
      </YStack>
    </>
  );
}
