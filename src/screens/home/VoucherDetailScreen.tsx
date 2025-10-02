import {useNavigation, useRoute} from '@react-navigation/native';
import {
  Text,
  ScrollView,
  YStack,
  Button,
  XStack,
  Stack,
  Image,
  View,
} from 'tamagui';
import {IVoucher} from '../../types';
import AppBar from '../../components/AppBar';
import {ChevronLeft} from '@tamagui/lucide-icons';
import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  getOrganizationLogo,
  priceFormatV2,
  stringToDateFormatV2,
  stringToDateFormatV3,
} from '../../utils';

export default function VoucherDetailScreen() {
  const route = useRoute();
  const voucher = route.params as IVoucher;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
            Chi tiết mã giảm giá
          </Text>
        </XStack>
      </AppBar>

      <ScrollView flexGrow={1} width={'100%'}>
        <YStack
          flex={1}
          width={'100%'}
          gap={16}
          paddingTop={16}
          paddingHorizontal={16}
          paddingBottom={insets.bottom + 16}>
          <Stack
            paddingVertical={8}
            borderWidth={1}
            flexDirection="row"
            borderColor="green"
            backgroundColor={'white'}
            alignItems="center"
            height={120}
            borderRadius={4}>
            <Stack
              alignItems="center"
              justifyContent="center"
              paddingHorizontal={12}>
              <Image
                source={{
                  uri:
                    getOrganizationLogo(voucher.event.organization) ??
                    require('../../assets/placeholder.png'),
                }}
                width={90}
                height={90}
                borderRadius={4}
              />
            </Stack>

            <View
              flexDirection="column"
              justifyContent="space-between"
              height={'90%'}>
              {Array.from({length: 10}).map((_, i) => (
                <View
                  key={'Dashed' + i}
                  width={1}
                  height={6}
                  backgroundColor="green"
                />
              ))}
            </View>

            <YStack
              flex={1}
              paddingHorizontal={12}
              height={'100%'}
              justifyContent="space-between">
              <XStack>
                <YStack flex={1} justifyContent="center">
                  <Text fontSize={'$6'} fontWeight={700} numberOfLines={1}>
                    Giảm{' '}
                    {voucher.discount_type === 'PERCENTAGE'
                      ? voucher.discount_value
                      : priceFormatV2(voucher.discount_value)}
                    {voucher.discount_type === 'PERCENTAGE' ? '%' : ''}
                  </Text>
                  <Text fontSize={'$4'} color="#545252ff" numberOfLines={1}>
                    Đơn tối thiểu {priceFormatV2(voucher.min_order_value!)}
                  </Text>
                </YStack>
              </XStack>
              <YStack>
                <Text fontSize={'$3'} numberOfLines={1} color="#2f87dfff">
                  {''}
                </Text>
                <Text fontSize={'$3'} color="#545252ff" numberOfLines={1}>
                  HSD: {stringToDateFormatV3(voucher.valid_to)}
                </Text>
              </YStack>
            </YStack>
          </Stack>

          <YStack gap={4}>
            <Text fontSize={'$6'} fontWeight="bold">
              Thời gian áp dụng
            </Text>
            <Text fontSize={'$5'} lineHeight={24}>
              {stringToDateFormatV2(voucher.valid_from) +
                ' - ' +
                stringToDateFormatV2(voucher.valid_to)}
            </Text>
          </YStack>

          <YStack gap={4}>
            <Text fontSize={'$6'} fontWeight="bold">
              Ưu đãi
            </Text>
            <Text fontSize={'$5'} lineHeight={24}>
              Mức giảm:{' '}
              {voucher.discount_type === 'PERCENTAGE'
                ? voucher.discount_value
                : priceFormatV2(voucher.discount_value)}
              {voucher.discount_type === 'PERCENTAGE' ? '%' : ''}
            </Text>
          </YStack>

          <YStack gap={4}>
            <Text fontSize={'$6'} fontWeight="bold">
              Điều kiện áp dụng
            </Text>
            <Text fontSize={'$5'} lineHeight={24}>
              {'\u2022'} Đơn tối thiểu từ{' '}
              {priceFormatV2(voucher.min_order_value!)}
            </Text>
            <Text fontSize={'$5'} lineHeight={24}>
              {'\u2022'} Đơn hàng có số lượng vé tối thiểu từ{' '}
              {voucher.min_ticket_quantity}
            </Text>
            <Text fontSize={'$5'} lineHeight={24}>
              {'\u2022'} Mỗi khách hàng được sử dụng mã tối đa{' '}
              {voucher.per_user_limit} lần
            </Text>
            <Text fontSize={'$5'} lineHeight={24}>
              {'\u2022'} Mỗi đơn chỉ được sử dụng 1 mã giảm giá
            </Text>
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
          <Button
            theme={'accent'}
            borderRadius={0}
            flex={1}
            onPress={() => navigation.goBack()}
            height={52}
            paddingHorizontal={24}>
            Đồng ý
          </Button>
        </XStack>
      </XStack>
    </YStack>
  );
}
