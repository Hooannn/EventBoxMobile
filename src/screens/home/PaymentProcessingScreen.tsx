import React, {useEffect} from 'react';
import {ZStack, Stack, Text} from 'tamagui';
import Lottie from 'lottie-react-native';
import {SOCKET_URL} from '../../hooks/useAxios';
import useAuthStore from '../../store/auth.store';
import {io} from 'socket.io-client';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import {SCREENS} from '../../navigation';

export default function PaymentProcessingScreen() {
  const {user} = useAuthStore();
  const navigation = useNavigation();
  const route = useRoute();
  const {orderId} = route.params as {orderId: string};

  useEffect(() => {
    const socket = io(
      `${SOCKET_URL}/order?user_id=${user?.id}&order_id=${orderId}`,
      {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      },
    );

    socket.on('connect', () => {
      console.log('✅ Connected:', socket.id);
    });

    socket.on('order_fulfilled', e => {
      console.log('🎉 Order fulfilled:', e);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: SCREENS.PAYMENT_SUCCESS, params: {orderId}}],
        }),
      );
    });

    socket.on('disconnect', reason => {
      console.log('❌ Disconnected:', reason);
    });

    socket.on('reconnect_attempt', attempt => {
      console.log(`🔁 Reconnecting... (${attempt})`);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ZStack animation={'100ms'} fullscreen backgroundColor={'whitesmoke'}>
      <Stack alignItems="center" justifyContent="center" flex={1}>
        <Lottie
          autoPlay
          loop
          style={{width: 200, height: 200}}
          source={require('../../assets/PaymentProcessing.json')}
        />
        <Text maxWidth={'80%'} textAlign="center" fontSize="$3" color="$color">
          Hãy đợi trong giây lát, đơn hàng{' '}
          <Text fontWeight={700}>#{orderId}</Text> của bạn đang được xử lý...
          Vui lòng không rời khỏi trang này cho đến khi quá trình hoàn tất.
        </Text>
      </Stack>
    </ZStack>
  );
}
