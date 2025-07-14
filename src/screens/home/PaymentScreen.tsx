import React, {useEffect, useState} from 'react';
import AppBar from '../../components/AppBar';
import {
  Button,
  Image,
  RadioGroup,
  ScrollView,
  Separator,
  Text,
  XStack,
  YStack,
} from 'tamagui';
import {Calendar, ChevronLeft, MapPin} from '@tamagui/lucide-icons';
import {
  formatHoursAndMinutes,
  priceFormat,
  stringToDateFormatV2,
} from '../../utils';
import {useNavigation, useRoute} from '@react-navigation/native';
import {IEvent, IResponseData} from '../../types';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useAuthStore from '../../store/auth.store';
import useToast from '../../hooks/useToast';
import useAxios from '../../hooks/useAxios';
import {useMutation} from '@tanstack/react-query';
import {Alert} from 'react-native';
import LoadingOverlay from '../../components/LoadingOverlay';

export default function PaymentScreen() {
  const {toast} = useToast();
  const route = useRoute();
  const axios = useAxios();

  const cancelReservationMutation = useMutation({
    mutationFn: () =>
      axios.post<IResponseData<boolean>>('/v1/orders/reservation/cancel'),
  });

  const goBack = async () => {
    try {
      await cancelReservationMutation.mutateAsync();
    } finally {
      navigation.goBack();
    }
  };

  const handleGoBack = () => {
    Alert.alert(
      'Huỷ đặt vé',
      'Bạn sẽ mất số lượng loại vé đã đặt trước nếu huỷ. Bạn có chắc chắn muốn huỷ không?',
      [
        {
          text: 'Ở lại',
          style: 'cancel',
        },
        {
          text: 'Huỷ đặt vé',
          style: 'destructive',
          onPress: goBack,
        },
      ],
      {cancelable: true},
    );
  };

  const {event, eventShowId, tickets, totalPrice, expirationDate} =
    route.params as {
      event: IEvent;
      eventShowId: number;
      tickets: {
        ticket_id: number;
        quantity: number;
      }[];
      totalPrice: number;
      expirationDate: string;
    };
  const {user} = useAuthStore();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const getEventShow = () => {
    return event.shows.find(show => show.id === eventShowId);
  };

  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    const targetTime = new Date(expirationDate).getTime();
    const now = new Date().getTime();
    const diff = targetTime - now;
    setRemainingTime(formatHoursAndMinutes(diff));

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setRemainingTime('00:00:00');
        clearInterval(interval);
        toast.show('Thời gian đặt vé đã hết hạn', {
          message: 'Vui lòng thực hiện lại thao tác đặt vé.',
          customData: {
            theme: 'yellow',
          },
        });
        navigation.goBack();
        return;
      }

      setRemainingTime(formatHoursAndMinutes(diff));
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expirationDate]);

  const getTickets = () => {
    return event.shows.find(show => show.id === eventShowId)?.tickets || [];
  };

  const getTicketById = (ticketId: number) => {
    return getTickets().find(ticket => ticket.id === ticketId);
  };

  const getTicketValue = (ticketId: number) => {
    const ticket = tickets.find(t => t.ticket_id === ticketId);
    return ticket ? ticket.quantity : 0;
  };

  const isLoading = cancelReservationMutation.isPending;

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <YStack
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <AppBar>
          <YStack flex={1} width={'100%'}>
            <XStack alignItems="center" gap={8}>
              <Button
                backgroundColor={'transparent'}
                variant="outlined"
                themeInverse
                circular
                onPress={handleGoBack}
                icon={<ChevronLeft size={20} />}
              />
              <Text fontSize={'$7'} fontWeight="bold" color={'white'}>
                Thanh toán
              </Text>
            </XStack>

            <XStack alignItems="center" gap={8} justifyContent="center">
              <Text color={'whitesmoke'} fontSize={'$4'}>
                Hoàn tất đặt vé trong
              </Text>
              <Text color={'whitesmoke'} fontSize={'$6'} fontWeight="bold">
                {remainingTime}
              </Text>
            </XStack>
          </YStack>
        </AppBar>

        <ScrollView flexGrow={1} width={'100%'}>
          <YStack flex={1} width={'100%'} padding={16} gap={16}>
            <YStack
              gap={8}
              borderRadius={12}
              backgroundColor={'white'}
              padding={16}>
              <Text fontWeight={700} fontSize={'$6'} color={'#38383d'}>
                {event.title}
              </Text>
              <Separator borderWidth={1} />
              <XStack gap={8}>
                <MapPin color={'#38383d'} size={16} />
                <YStack>
                  <Text fontWeight={800} color={'#38383d'}>
                    {event.place_name}
                  </Text>
                  <Text color={'#38383d'} fontSize={'$3'}>
                    {event.address}
                  </Text>
                </YStack>
              </XStack>
              <XStack gap={8} alignItems="center">
                <Calendar color={'#38383d'} size={16} />
                <XStack alignItems="center" gap={4}>
                  <Text color={'#38383d'} fontWeight={800}>
                    {stringToDateFormatV2(getEventShow()!.start_time)} -{' '}
                    {stringToDateFormatV2(getEventShow()!.end_time)}
                  </Text>
                </XStack>
              </XStack>
            </YStack>

            <YStack
              gap={8}
              borderRadius={12}
              backgroundColor={'white'}
              padding={16}>
              <Text fontWeight={700} fontSize={'$6'} color={'#38383d'}>
                Thông tin nhận vé
              </Text>
              <Separator borderWidth={1} />
              <XStack gap={8}>
                <Text color={'#38383d'}>
                  Vé điện tử sẽ được hiển thị trong mục{' '}
                  <Text fontWeight={800}>"Vé của tôi"</Text> trong ứng dụng của
                  tài khoản <Text fontWeight={800}>{user?.email}</Text>
                </Text>
              </XStack>
            </YStack>

            <YStack
              gap={8}
              borderRadius={12}
              backgroundColor={'white'}
              padding={16}>
              <Text fontWeight={700} fontSize={'$6'} color={'#38383d'}>
                Phương thức thanh toán
              </Text>
              <Separator borderWidth={1} />
              <XStack gap={8}>
                <RadioGroup value="paypal">
                  <YStack width={'100%'} gap={16} marginTop={8}>
                    <XStack alignItems="center" gap={12}>
                      <RadioGroup.Item value="paypal" size="$4">
                        <RadioGroup.Indicator />
                      </RadioGroup.Item>

                      <XStack alignItems="center" gap={8}>
                        <Image
                          source={require('../../assets/PayPal.png')}
                          width={20}
                          height={20}
                        />
                        <Text>Thanh toán bằng PayPal</Text>
                      </XStack>
                    </XStack>
                    <XStack alignItems="center" gap={12}>
                      <RadioGroup.Item value="credit" size="$4">
                        <RadioGroup.Indicator />
                      </RadioGroup.Item>

                      <XStack alignItems="center" gap={8}>
                        <Image
                          source={require('../../assets/cc.png')}
                          width={20}
                          height={20}
                        />
                        <Text color={'gray'}>
                          Thanh toán bằng thẻ tín dụng (Chưa hỗ trợ)
                        </Text>
                      </XStack>
                    </XStack>
                  </YStack>
                </RadioGroup>
              </XStack>
            </YStack>

            <YStack
              gap={8}
              borderRadius={12}
              backgroundColor={'white'}
              padding={16}>
              <Text fontWeight={700} fontSize={'$6'} color={'#38383d'}>
                Thông tin đặt vé
              </Text>
              <Separator borderWidth={1} />
              <XStack
                alignItems="center"
                width={'100%'}
                justifyContent="space-between">
                <Text fontSize={'$4'}>Loại vé</Text>
                <Text fontSize={'$4'}>Số lượng</Text>
              </XStack>
              <YStack gap={16} marginTop={8}>
                {tickets.map(ticket => (
                  <XStack
                    justifyContent="space-between"
                    key={'OrderDetails' + ticket.ticket_id}
                    alignItems="center">
                    <YStack>
                      <Text fontSize={'$6'} fontWeight={700}>
                        {getTicketById(ticket.ticket_id)!.name}
                      </Text>
                      <Text fontSize={'$5'}>
                        {priceFormat(getTicketById(ticket.ticket_id)!.price)}
                      </Text>
                    </YStack>
                    <YStack alignItems="flex-end">
                      <Text fontSize={'$5'}>
                        {getTicketValue(ticket.ticket_id)}
                      </Text>
                      <Text fontSize={'$5'}>
                        {priceFormat(
                          getTicketValue(ticket.ticket_id) *
                            getTicketById(ticket.ticket_id)!.price,
                        )}
                      </Text>
                    </YStack>
                  </XStack>
                ))}
              </YStack>
              <XStack
                width={'100%'}
                alignItems="center"
                justifyContent="space-between"
                marginTop={16}>
                <Text fontSize={'$6'}>Tạm tính</Text>
                <Text fontWeight={700} fontSize={'$7'} color={'darkgreen'}>
                  {priceFormat(totalPrice)}
                </Text>
              </XStack>
              <Separator />

              <XStack
                width={'100%'}
                alignItems="center"
                justifyContent="space-between">
                <Text fontSize={'$6'}>Tổng tiền</Text>
                <Text fontWeight={700} fontSize={'$8'} color={'darkgreen'}>
                  {priceFormat(totalPrice)}
                </Text>
              </XStack>

              <XStack
                width={'100%'}
                marginTop={4}
                alignItems="center"
                justifyContent="space-between">
                <Text fontSize={'$3'}>
                  Bằng cách tiến hành đặt vé, bạn đồng ý với{' '}
                  <Text fontWeight={800}>Điều khoản dịch vụ</Text> và{' '}
                  <Text fontWeight={800}>Chính sách bảo mật</Text> của chúng tôi
                </Text>
              </XStack>
            </YStack>
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
            <YStack flex={1}>
              <Text fontSize={'$4'}>Tổng tiền</Text>
              <XStack alignItems="center" gap={8}>
                <Text fontWeight={700} fontSize={'$8'} color={'darkgreen'}>
                  {priceFormat(totalPrice)}
                </Text>
              </XStack>
            </YStack>

            <Button
              theme={'accent'}
              borderRadius={0}
              flex={1}
              height={52}
              paddingHorizontal={24}>
              Thanh toán
            </Button>
          </XStack>
        </XStack>
      </YStack>
    </>
  );
}
