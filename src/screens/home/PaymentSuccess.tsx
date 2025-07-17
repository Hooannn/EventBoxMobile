import React from 'react';
import {ZStack, Stack, Text, Button} from 'tamagui';
import Lottie from 'lottie-react-native';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import {Tickets} from '@tamagui/lucide-icons';
import {SCREENS} from '../../navigation';

export default function PaymentSuccessScreen() {
  const route = useRoute();
  const {orderId} = route.params as {orderId: string};
  const navigation = useNavigation();
  return (
    <ZStack animation={'100ms'} fullscreen backgroundColor={'whitesmoke'}>
      <Stack alignItems="center" justifyContent="center" flex={1}>
        <Lottie
          autoPlay
          loop
          style={{width: 200, height: 200}}
          source={require('../../assets/PaymentSuccess.json')}
        />
        <Text
          maxWidth={'80%'}
          textAlign="center"
          fontSize="$8"
          color="$color"
          fontWeight={700}>
          Thanh toán thành công!
        </Text>
        <Text maxWidth={'80%'} textAlign="center" fontSize="$5" color="$color">
          Đơn hàng <Text fontWeight={700}>#{orderId}</Text> của bạn đã được xử
          lý.
        </Text>
        <Text maxWidth={'80%'} textAlign="center" fontSize="$5" color="$color">
          Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
        </Text>

        <Button
          theme={'accent'}
          borderRadius={0}
          width={'50%'}
          marginTop="$4"
          marginHorizontal={'auto'}
          icon={Tickets}
          onPress={() => {
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
          }}>
          Vé của tôi
        </Button>
        <Button
          borderRadius={0}
          width={'50%'}
          marginHorizontal={'auto'}
          onPress={() => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: SCREENS.TAB_NAVIGATION,
                    params: {initialTab: SCREENS.HOME},
                  },
                ],
              }),
            );
          }}>
          Trang chủ
        </Button>
      </Stack>
    </ZStack>
  );
}
