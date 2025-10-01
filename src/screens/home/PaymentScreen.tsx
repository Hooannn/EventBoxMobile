import React, {useCallback, useEffect, useRef, useState} from 'react';
import AppBar from '../../components/AppBar';
import {
  Button,
  Image,
  Input,
  RadioGroup,
  ScrollView,
  Separator,
  Spinner,
  Stack,
  Text,
  XStack,
  YStack,
} from 'tamagui';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  X,
  XCircle,
} from '@tamagui/lucide-icons';
import {
  formatHoursAndMinutes,
  priceFormat,
  priceFormatV2,
  stringToDateFormatV2,
} from '../../utils';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import {IEvent, IOrder, IResponseData, ITicket, IVoucher} from '../../types';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useAuthStore from '../../store/auth.store';
import useToast from '../../hooks/useToast';
import useAxios from '../../hooks/useAxios';
import {useMutation, useQuery} from '@tanstack/react-query';
import {Alert, Linking, useWindowDimensions} from 'react-native';
import LoadingOverlay from '../../components/LoadingOverlay';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {SCREENS} from '../../navigation';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import BottomSheetBackdrop from '../../components/BottomSheetBackdrop';
import VoucherCard from './VoucherCard';

export default function PaymentScreen() {
  const {toast, toastOnError} = useToast();
  const {user} = useAuthStore();
  const route = useRoute();
  const {height: screenHeight} = useWindowDimensions();
  const axios = useAxios();

  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(
    null,
  );

  const [voucherCode, setVoucherCode] = useState('');

  const voucherPickerBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleVoucherPickerPresentModalPress = useCallback(() => {
    setVoucherCode('');
    setSelectedVoucherId(null);
    voucherPickerBottomSheetModalRef.current?.present();
  }, []);

  const {event, eventShowId, reservation} = route.params as {
    event: IEvent;
    eventShowId: number;
    reservation: IOrder;
  };
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const cancelReservationMutation = useMutation({
    mutationFn: () =>
      axios.post<IResponseData<boolean>>('/v1/orders/reservation/cancel'),
  });

  const getPublicVouchersQuery = useQuery({
    queryKey: ['fetch/vouchers/event/eventId/public', event.id],
    queryFn: () =>
      axios.get<IResponseData<IVoucher[]>>(
        `/v1/vouchers/event/${event.id}/public`,
      ),
    refetchOnWindowFocus: false,
  });

  const publicVouchers = getPublicVouchersQuery.data?.data.data || [];

  const getOrderVoucher = useQuery({
    queryKey: ['fetch/vouchers/order/orderId', reservation.id],
    queryFn: () =>
      axios.get<IResponseData<IVoucher>>(
        `/v1/vouchers/order/${reservation.id}`,
      ),
    refetchOnWindowFocus: false,
  });

  const orderVoucher = getOrderVoucher.data?.data.data;

  const applyVoucherMutation = useMutation({
    mutationFn: (params: {code: string}) =>
      axios.post<IResponseData<boolean>>(
        `/v1/vouchers/order/${reservation.id}/apply`,
        params,
      ),
    onError: toastOnError,
    onSuccess: _ => {
      getOrderVoucher.refetch();
      toast.show('Thành công', {
        message: 'Áp dụng mã giảm giá thành công',
        customData: {
          theme: 'green',
        },
      });
      voucherPickerBottomSheetModalRef.current?.dismiss();
    },
  });

  const removeVoucherMutation = useMutation({
    mutationFn: () =>
      axios.post<IResponseData<boolean>>(
        `/v1/vouchers/order/${reservation.id}/remove`,
      ),
    onError: toastOnError,
    onSuccess: _ => {
      getOrderVoucher.refetch();
      toast.show('Thành công', {
        message: 'Xoá mã giảm giá thành công',
        customData: {
          theme: 'green',
        },
      });
    },
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

  const getEventShow = () => {
    return event.shows.find(show => show.id === eventShowId);
  };

  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    const targetTime = new Date(reservation.expired_at).getTime();
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
  }, [reservation.expired_at]);

  const getTickets = () => {
    return event.shows.find(show => show.id === eventShowId)?.tickets || [];
  };

  const getTicketById = (ticketId: number) => {
    return getTickets().find(ticket => ticket.id === ticketId);
  };

  const groupTickets = () => {
    return reservation.items.reduce<
      {
        ticket: ITicket;
        quantity: number;
      }[]
    >((acc, item) => {
      const ticketId = item.ticket.id;
      const existing = acc.find(entry => entry.ticket.id === ticketId);

      if (existing) {
        existing.quantity += 1;
      } else {
        acc.push({ticket: item.ticket, quantity: 1});
      }

      return acc;
    }, []);
  };

  const paymentMutation = useMutation({
    mutationFn: (params: {
      return_url: string;
      cancel_url: string;
      order_id: number;
    }) => {
      return axios.post<
        IResponseData<{
          id: string;
        }>
      >('/v1/orders/reservation/payment', params);
    },
    onError: toastOnError,
    onSuccess(data) {
      const orderId = data.data.data.id;
      const checkoutUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`;
      openPayPalPopup(checkoutUrl);
    },
  });

  const onSubmitPayment = () => {
    const returnUrl = `eventbox://paypal-return?order_id=${reservation.id}`;
    const cancelUrl = `eventbox://paypal-cancel?order_id=${reservation.id}`;

    paymentMutation.mutate({
      order_id: reservation.id,
      return_url: returnUrl,
      cancel_url: cancelUrl,
    });
  };

  async function openPayPalPopup(checkoutUrl: string) {
    Linking.addEventListener('url', handlePayPalRedirect);
    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(checkoutUrl, {
          // iOS Properties
          dismissButtonStyle: 'cancel',
          animated: true,
          modalPresentationStyle: 'fullScreen',
          modalTransitionStyle: 'coverVertical',
          modalEnabled: true,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: false,
          enableUrlBarHiding: true,
          enableDefaultShare: false,
          forceCloseOnRedirection: false,
        });
      } else {
        Linking.openURL(checkoutUrl);
      }
    } catch (error: any) {
      toast.show('Lỗi', {
        message: error.message,
        customData: {
          theme: 'red',
        },
      });
    }
  }

  const handlePayPalRedirect = (event: {url: string}) => {
    const url = event.url;
    if (url.includes('paypal-return')) {
      InAppBrowser.close();
      toast.show('Thành công', {
        message: 'Thanh toán thành công!',
        customData: {
          theme: 'green',
        },
      });

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: SCREENS.PAYMENT_PROCESSING,
              params: {orderId: reservation.id},
            },
          ],
        }),
      );
    } else if (url.includes('paypal-cancel')) {
      InAppBrowser.close();
      toast.show('Hủy', {
        message: 'Bạn đã hủy thanh toán!',
        customData: {
          theme: 'yellow',
        },
      });
    }
    Linking.removeAllListeners('url');
  };

  const isLoading =
    cancelReservationMutation.isPending ||
    paymentMutation.isPending ||
    applyVoucherMutation.isPending ||
    removeVoucherMutation.isPending ||
    getOrderVoucher.isLoading;

  const onApplyVoucherButtonPress = () => {
    if (!voucherCode.trim()) {
      return;
    }
    applyVoucherMutation.mutate({code: voucherCode.trim()});
  };

  const onDoneVoucherButtonPress = () => {
    if (selectedVoucherId) {
      const selectedVoucher = publicVouchers.find(
        voucher => voucher.id === selectedVoucherId,
      );
      if (selectedVoucher) {
        applyVoucherMutation.mutate({code: selectedVoucher.code});
      }
    } else {
      voucherPickerBottomSheetModalRef.current?.dismiss();
    }
  };

  const getTotalDiscount = () => {
    if (orderVoucher) {
      let discount = 0;
      if (orderVoucher.discount_type === 'PERCENTAGE') {
        discount =
          reservation.place_total * (orderVoucher.discount_value / 100);
      } else {
        discount = orderVoucher.discount_value;
      }
      if (discount > reservation.place_total) {
        return reservation.place_total;
      }
      return discount;
    }
    return 0;
  };

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
              <XStack
                alignItems="center"
                justifyContent="space-between"
                onPress={() => {
                  if (orderVoucher) {
                    return;
                  }
                  handleVoucherPickerPresentModalPress();
                }}>
                <Text fontWeight={700} fontSize={'$6'} color={'#38383d'}>
                  Mã giảm giá
                </Text>
                <ChevronRight color={'darkgray'} size={16} />
              </XStack>
              <Separator borderWidth={1} />
              <XStack gap={8}>
                {orderVoucher ? (
                  <Button borderRadius={100} size={'$3'} theme={'green'}>
                    <Text>
                      {orderVoucher.code} - Giảm{' '}
                      {orderVoucher.discount_type === 'PERCENTAGE'
                        ? orderVoucher.discount_value
                        : priceFormatV2(orderVoucher.discount_value)}
                      {orderVoucher.discount_type === 'PERCENTAGE' ? '%' : ''}
                    </Text>

                    <XCircle
                      size={16}
                      color={'grey'}
                      onPress={() => {
                        removeVoucherMutation.mutate();
                      }}
                    />
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    borderRadius={100}
                    size={'$3'}
                    onPress={handleVoucherPickerPresentModalPress}>
                    <Plus color={'#38383d'} size={16} />
                    <Text color={'#38383d'}>Thêm mã giảm giá</Text>
                  </Button>
                )}
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
                {groupTickets().map(item => (
                  <XStack
                    justifyContent="space-between"
                    key={'OrderDetails' + item.ticket.id}
                    alignItems="center">
                    <YStack>
                      <Text fontSize={'$6'} fontWeight={700}>
                        {getTicketById(item.ticket.id)!.name}
                      </Text>
                      <Text fontSize={'$5'}>
                        {priceFormat(getTicketById(item.ticket.id)!.price)}
                      </Text>
                    </YStack>
                    <YStack alignItems="flex-end">
                      <Text fontSize={'$5'}>{item.quantity}</Text>
                      <Text fontSize={'$5'}>
                        {priceFormat(
                          item.quantity * getTicketById(item.ticket.id)!.price,
                        )}
                      </Text>
                    </YStack>
                  </XStack>
                ))}
              </YStack>

              <Separator marginTop={16} />

              <XStack
                width={'100%'}
                alignItems="center"
                justifyContent="space-between">
                <Text fontSize={'$6'}>Tạm tính</Text>
                <Text fontSize={'$6'}>
                  {priceFormat(reservation.place_total)}
                </Text>
              </XStack>

              <XStack
                width={'100%'}
                alignItems="center"
                justifyContent="space-between">
                <Text fontSize={'$6'}>Giảm giá</Text>
                <Text fontSize={'$6'} color={orderVoucher ? 'darkgreen' : ''}>
                  - {priceFormat(getTotalDiscount())}
                </Text>
              </XStack>

              <Separator />

              <XStack
                width={'100%'}
                alignItems="center"
                justifyContent="space-between">
                <Text fontSize={'$6'}>Tổng tiền</Text>
                <Text fontWeight={700} fontSize={'$8'} color={'darkgreen'}>
                  {priceFormat(reservation.place_total - getTotalDiscount())}
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
                  {priceFormat(reservation.place_total - getTotalDiscount())}
                </Text>
              </XStack>
            </YStack>

            <Button
              theme={'accent'}
              borderRadius={0}
              flex={1}
              onPress={onSubmitPayment}
              height={52}
              paddingHorizontal={24}>
              Thanh toán
            </Button>
          </XStack>
        </XStack>
      </YStack>

      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={voucherPickerBottomSheetModalRef}
          maxDynamicContentSize={screenHeight * 0.8}
          backdropComponent={() => (
            <BottomSheetBackdrop
              onPress={() => {
                voucherPickerBottomSheetModalRef.current?.dismiss();
              }}
            />
          )}
          containerStyle={{zIndex: 100}}>
          <BottomSheetScrollView
            style={{
              flex: 1,
            }}>
            <YStack
              flex={1}
              width={'100%'}
              paddingHorizontal={24}
              minHeight={screenHeight * 0.8}
              paddingBottom={insets.bottom + 12}>
              <XStack
                alignItems="center"
                paddingVertical={12}
                position="relative"
                width={'100%'}
                justifyContent="center">
                <Text fontSize={'$6'} fontWeight={800}>
                  Chọn mã giảm giá
                </Text>

                <Button
                  position="absolute"
                  right={0}
                  onPress={() =>
                    voucherPickerBottomSheetModalRef.current?.dismiss()
                  }
                  circular
                  icon={<X size={16} />}
                />
              </XStack>
              <Separator />
              <YStack gap={8} marginTop={16} flex={1}>
                <XStack alignItems="center" justifyContent="space-between">
                  <Input
                    placeholder={`Nhập mã giảm giá`}
                    returnKeyType="done"
                    width={'70%'}
                    height={48}
                    borderRadius={0}
                    value={voucherCode}
                    onChangeText={setVoucherCode}
                  />
                  <Button
                    height={48}
                    theme={'accent'}
                    borderRadius={0}
                    onPress={onApplyVoucherButtonPress}
                    paddingHorizontal={24}>
                    Áp dụng
                  </Button>
                </XStack>

                <Text fontSize={'$4'} marginTop={8}>
                  Mã giảm giá từ ban tổ chức
                </Text>

                {getPublicVouchersQuery.isPending ? (
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    paddingTop={16}>
                    <Spinner />
                  </Stack>
                ) : (
                  <>
                    {publicVouchers.length > 0 ? (
                      <YStack gap={8}>
                        {publicVouchers.map(voucher => (
                          <VoucherCard
                            key={'VoucherPickerCard' + voucher.id}
                            isSelected={selectedVoucherId === voucher.id}
                            onPress={() => {
                              if (selectedVoucherId === voucher.id) {
                                setSelectedVoucherId(null);
                              } else {
                                setSelectedVoucherId(voucher.id);
                              }
                            }}
                            voucher={voucher}
                          />
                        ))}
                      </YStack>
                    ) : (
                      <Stack
                        alignItems="center"
                        justifyContent="center"
                        paddingTop={16}>
                        <Text color="gray">Không có mã giảm giá nào</Text>
                      </Stack>
                    )}
                  </>
                )}
              </YStack>
            </YStack>
          </BottomSheetScrollView>
          <XStack
            backgroundColor={'white'}
            gap={12}
            paddingTop={12}
            paddingHorizontal={24}
            paddingBottom={insets.bottom + 12}>
            <Button
              theme={'red'}
              borderRadius={0}
              onPress={() =>
                voucherPickerBottomSheetModalRef.current?.dismiss()
              }
              flex={1}
              height={52}
              paddingHorizontal={24}>
              Huỷ bỏ
            </Button>
            <Button
              theme={'accent'}
              borderRadius={0}
              flex={1}
              height={52}
              onPress={onDoneVoucherButtonPress}
              paddingHorizontal={24}>
              Xong
            </Button>
          </XStack>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </>
  );
}
