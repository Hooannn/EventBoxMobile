import {
  Button,
  ScrollView,
  Separator,
  Stack,
  Text,
  XStack,
  YStack,
} from 'tamagui';
import AppBar from '../../components/AppBar';
import {ChevronDown, ChevronLeft, ChevronUp} from '@tamagui/lucide-icons';
import {priceFormat} from '../../utils';
import {useNavigation, useRoute} from '@react-navigation/native';
import {IEvent, IOrder, IResponseData} from '../../types';
import useToast from '../../hooks/useToast';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import QuantityInput from '../../components/QuantityInput';
import {useCallback, useRef, useState} from 'react';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import useAxios from '../../hooks/useAxios';
import {useMutation} from '@tanstack/react-query';
import LoadingOverlay from '../../components/LoadingOverlay';
import {SCREENS} from '../../navigation';

export default function CheckOutScreen() {
  const route = useRoute();
  const {event, eventShowId} = route.params as {
    event: IEvent;
    eventShowId: number;
  };
  const navigation = useNavigation();
  const axios = useAxios();
  const {toastOnError} = useToast();
  const insets = useSafeAreaInsets();

  const getTickets = () => {
    return event.shows.find(show => show.id === eventShowId)?.tickets || [];
  };

  const [orderedTickets, setOrderedTickets] = useState(
    getTickets().map(ticket => ({
      id: ticket.id,
      quantity: 0,
    })),
  );

  const getTicketById = (ticketId: number) => {
    return getTickets().find(ticket => ticket.id === ticketId);
  };

  const getTicketValue = (ticketId: number) => {
    const ticket = orderedTickets.find(t => t.id === ticketId);
    return ticket ? ticket.quantity : 0;
  };

  const setQuantity = (ticketId: number, quantity: number) => {
    setOrderedTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId ? {...ticket, quantity} : ticket,
      ),
    );
  };

  const getTotalPrice = () => {
    return orderedTickets.reduce((total, ticket) => {
      const ticketData = getTickets().find(t => t.id === ticket.id);
      if (ticketData) {
        return total + ticketData.price * ticket.quantity;
      }
      return total;
    }, 0);
  };

  const showOrderDetails = () => {
    if (getTotalPrice() <= 0) {
      return;
    }
    handlePresentModalPress();
  };

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleDismissModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const makeReservationMutation = useMutation({
    mutationFn: () =>
      axios.post<IResponseData<IOrder>>('/v1/orders/reservation', {
        tickets: orderedTickets
          .filter(t => t.quantity > 0)
          .map(t => ({
            ticket_id: t.id,
            quantity: t.quantity,
          })),
      }),
    onError: toastOnError,
    onSuccess: res => {
      navigation.navigate(SCREENS.PAYMENT, {
        event,
        eventShowId,
        reservation: res.data.data,
      });
    },
  });

  const processPayment = () => {
    makeReservationMutation.mutate();
  };

  return (
    <>
      {makeReservationMutation.isPending && <LoadingOverlay />}
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
              Mua vé
            </Text>
          </XStack>
        </AppBar>

        <ScrollView flexGrow={1} width={'100%'}>
          <YStack flex={1} width={'100%'} padding={16}>
            <XStack
              alignItems="center"
              width={'100%'}
              justifyContent="space-between">
              <Text fontSize={'$4'}>Loại vé</Text>
              <Text fontSize={'$4'}>Số lượng</Text>
            </XStack>
            <YStack gap={16} marginTop={16}>
              {getTickets().map(ticket => (
                <Stack key={'OrderInputs' + ticket.id}>
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack>
                      <Text fontSize={'$6'} fontWeight={'700'}>
                        {ticket.name}
                      </Text>
                      <Text
                        fontSize={'$5'}
                        fontWeight={'700'}
                        color={'darkgreen'}>
                        {priceFormat(ticket.price)}
                      </Text>
                      {ticket.stock > 0 ? (
                        <Text fontSize={'$3'} color={'gray'} fontWeight={'500'}>
                          Còn {ticket.stock} vé
                        </Text>
                      ) : (
                        <Text color={'red'} fontSize={'$3'}>
                          Hết vé
                        </Text>
                      )}
                    </YStack>
                    {ticket.stock > 0 && (
                      <Stack alignItems="center" justifyContent="center">
                        <QuantityInput
                          value={getTicketValue(ticket.id)}
                          onChange={quantity => {
                            setQuantity(ticket.id, quantity);
                          }}
                          maxValue={ticket.stock}
                          minValue={0}
                          disabled={ticket.stock <= 0}
                        />
                      </Stack>
                    )}
                  </XStack>
                  <Separator borderWidth={1} marginTop={12} />
                </Stack>
              ))}
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
            <YStack flex={1} onPress={showOrderDetails}>
              <Text fontSize={'$4'}>Tổng tiền</Text>
              <XStack alignItems="center" gap={8}>
                <Text fontWeight={700} fontSize={'$8'} color={'darkgreen'}>
                  {priceFormat(getTotalPrice())}
                </Text>
                <ChevronUp size={20} color={'darkgreen'} />
              </XStack>
            </YStack>

            <Button
              theme={'accent'}
              onPress={processPayment}
              themeInverse={getTotalPrice() <= 0}
              borderRadius={0}
              flex={1}
              disabled={getTotalPrice() <= 0}
              height={52}
              paddingHorizontal={24}>
              Đến trang thanh toán
            </Button>
          </XStack>
        </XStack>
      </YStack>

      <BottomSheetModalProvider>
        <BottomSheetModal ref={bottomSheetModalRef}>
          <BottomSheetView
            style={{
              flex: 1,
            }}>
            <YStack
              flex={1}
              width={'100%'}
              paddingHorizontal={24}
              paddingBottom={insets.bottom + 12}>
              <XStack alignItems="center" justifyContent="space-between">
                <Text fontSize={'$5'}>Thông tin đặt vé</Text>
                <Button
                  onPress={handleDismissModalPress}
                  backgroundColor={'transparent'}
                  opacity={0.5}
                  iconAfter={ChevronDown}>
                  Thu gọn
                </Button>
              </XStack>

              <YStack gap={16} marginTop={8}>
                {orderedTickets
                  .filter(t => t.quantity > 0)
                  .map(ticket => (
                    <XStack
                      justifyContent="space-between"
                      key={'OrderDetails' + ticket.id}
                      alignItems="center">
                      <YStack>
                        <Text fontSize={'$6'} fontWeight={700}>
                          {getTicketById(ticket.id)!.name}
                        </Text>
                        <Text fontSize={'$5'}>
                          {priceFormat(getTicketById(ticket.id)!.price)}
                        </Text>
                      </YStack>
                      <YStack alignItems="flex-end">
                        <Text fontSize={'$5'}>{getTicketValue(ticket.id)}</Text>
                        <Text fontSize={'$5'}>
                          {priceFormat(
                            getTicketValue(ticket.id) *
                              getTicketById(ticket.id)!.price,
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
                  {priceFormat(getTotalPrice())}
                </Text>
              </XStack>

              <Separator marginTop={16} borderWidth={1} />

              <XStack marginTop={16} gap={4} alignItems="center" flex={1}>
                <YStack flex={1}>
                  <Text fontSize={'$4'}>Tổng tiền</Text>
                  <XStack alignItems="center" gap={8}>
                    <Text fontWeight={700} fontSize={'$8'} color={'darkgreen'}>
                      {priceFormat(getTotalPrice())}
                    </Text>
                  </XStack>
                </YStack>

                <Button
                  theme={'accent'}
                  themeInverse={getTotalPrice() <= 0}
                  borderRadius={0}
                  onPress={processPayment}
                  flex={1}
                  disabled={getTotalPrice() <= 0}
                  height={52}
                  paddingHorizontal={24}>
                  Đến trang thanh toán
                </Button>
              </XStack>
            </YStack>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </>
  );
}
