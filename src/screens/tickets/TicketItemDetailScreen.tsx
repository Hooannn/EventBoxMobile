import {ChevronLeft, Ticket} from '@tamagui/lucide-icons';
import React, {useEffect, useState} from 'react';
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
import {IEvent, IResponseData, ITicketItemDetail} from '../../types';
import {
  formatHoursAndMinutes,
  getEventLogo,
  orderStatusTexts,
  priceFormatV2,
  stringToDateFormatV2,
} from '../../utils';
import QRCode from 'react-native-qrcode-svg';
import useAxios from '../../hooks/useAxios';
import {useQuery} from '@tanstack/react-query';
import {jwtDecode} from 'jwt-decode';
import dayjs from '../../libs/dayjs';
export default function TicketItemDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const axios = useAxios();
  const ticketItem = route.params as ITicketItemDetail & {
    status: 'ongoing' | 'upcoming' | 'past';
  };

  const getQrCodeQuery = useQuery({
    queryKey: [
      'fetch/tickets/items/id/qrcode',
      ticketItem.id,
      ticketItem.status,
    ],
    queryFn: () =>
      ticketItem.status === 'ongoing'
        ? axios.get<IResponseData<string>>(
            `/v1/tickets/items/${ticketItem.id}/qrcode`,
          )
        : null,
    refetchOnWindowFocus: false,
    enabled: ticketItem.status === 'ongoing',
  });

  const [expiration, setExpiration] = useState(0);
  const [remainingTime, setRemainingTime] = useState('');

  const qrCode = getQrCodeQuery.data?.data?.data;

  const extractExpirationTime = (qrCode: string) => {
    const token = jwtDecode<{exp: number}>(qrCode);
    const expirationDate = new Date(token.exp * 1000);
    return expirationDate.getTime();
  };

  useEffect(() => {
    if (qrCode) {
      const diff = extractExpirationTime(qrCode);
      setExpiration(diff);
    }
  }, [qrCode]);

  useEffect(() => {
    const targetTime = expiration;
    const now = new Date().getTime();
    const diff = targetTime - now;
    setRemainingTime(formatHoursAndMinutes(diff));

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setRemainingTime('00:00:00');
        clearInterval(interval);
        getQrCodeQuery.refetch();
        return;
      }

      setRemainingTime(formatHoursAndMinutes(diff));
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiration]);

  return (
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
            Chi tiết vé
          </Text>
        </XStack>
      </AppBar>

      <ScrollView flexGrow={1} width={'100%'}>
        <YStack
          flex={1}
          width={'100%'}
          padding={16}
          gap={12}
          paddingBottom={32}>
          <Card bordered backgroundColor={'white'} height={600}>
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
                  <Text fontWeight={800} textAlign="center" fontSize={'$6'}>
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
              <Stack height={'50%'} alignItems="center" justifyContent="center">
                <YStack
                  flex={1}
                  width={'100%'}
                  justifyContent="center"
                  gap={8}
                  paddingHorizontal={24}
                  paddingVertical={24}>
                  <XStack justifyContent="space-between" gap={16}>
                    <YStack width={'50%'}>
                      <Text fontSize={'$3'}>Địa điểm</Text>
                      <Text fontWeight={700} fontSize={'$3'}>
                        {ticketItem.ticket.event_show.event.place_name}
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
                  <Stack
                    justifyContent="center"
                    gap={2}
                    alignItems="center"
                    flexDirection="column">
                    {getQrCodeQuery.isLoading ? (
                      <Spinner />
                    ) : (
                      <>
                        {qrCode ? (
                          <>
                            <QRCode size={100} value={qrCode} />
                            <Text fontSize={'$2'} color={'gray'}>
                              Hết hạn trong {remainingTime}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Ticket size={100} color={'lightgray'} />
                            <Text fontSize={'$3'} color={'gray'}>
                              {ticketItem.status === 'past'
                                ? 'Chương trình đã kết thúc.'
                                : 'Chương trình chưa bắt đầu. Vui lòng quay lại sau.'}
                            </Text>
                          </>
                        )}
                      </>
                    )}
                  </Stack>
                </YStack>
              </Stack>
            </YStack>
          </Card>

          <Card bordered backgroundColor={'white'} padding={16} gap={12}>
            <Text fontSize={'$6'} fontWeight={'700'}>
              Đơn hàng #{ticketItem.order.id}
            </Text>
            <Separator />
            <XStack>
              <YStack width={'50%'}>
                <Text fontSize={'$3'}>Phương thức thanh toán</Text>
                <Text fontWeight={700} fontSize={'$3'}>
                  PayPal
                </Text>
              </YStack>
              <YStack width={'50%'}>
                <Text fontSize={'$3'}>Trạng thái</Text>
                <Text fontWeight={700} fontSize={'$3'}>
                  {orderStatusTexts[ticketItem.order.status]}
                </Text>
              </YStack>
            </XStack>
            <XStack>
              <YStack width={'100%%'}>
                <Text fontSize={'$3'}>Thông tin thanh toán</Text>
                {ticketItem.order.payments.map(payment => (
                  <XStack key={'Payment' + payment.id}>
                    <Text fontSize={'$3'} width={'50%'}>
                      Ngày:{' '}
                      <Text fontWeight={'700'}>
                        {dayjs(payment.captured_at).format('DD/MM/YYYY')}
                      </Text>
                    </Text>
                    <Text fontSize={'$3'} width={'50%'}>
                      Số tiền:{' '}
                      <Text fontWeight={'700'}>
                        {priceFormatV2(
                          payment.gross_amount ?? 0,
                          payment.gross_amount_currency!,
                        )}
                      </Text>
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </XStack>
          </Card>

          <Card bordered backgroundColor={'white'} padding={16} gap={12}>
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
                          {dayjs(trace.created_at).format('DD/MM/YYYY, HH:mm')}
                        </Text>
                      </YStack>
                      <YStack alignItems="flex-end">
                        <Text fontSize={'$2'} color={'gray'}>
                          Người thực hiện
                        </Text>
                        <Text fontSize={'$2'} color={'gray'}>
                          {trace.issuer.first_name} {trace.issuer.last_name}
                        </Text>
                      </YStack>
                    </XStack>
                  ))}
                </>
              ) : (
                <>
                  <Text fontSize={'$3'} color={'gray'} textAlign="center">
                    Vé chưa được sử dụng
                  </Text>
                </>
              )}
            </YStack>
          </Card>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
