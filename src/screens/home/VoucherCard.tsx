import React from 'react';
import {Image, Stack, Text, View, XStack, YStack} from 'tamagui';
import {IVoucher} from '../../types';
import {
  getOrganizationLogo,
  priceFormatV2,
  stringToDateFormatV3,
} from '../../utils';
import {Check} from '@tamagui/lucide-icons';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../../navigation';

export default function VoucherCard(props: {
  voucher: IVoucher;
  isSelected: boolean;
  onPress: () => void;
}) {
  const navigation = useNavigation();
  return (
    <Stack
      paddingVertical={8}
      onPress={props.onPress}
      borderWidth={1}
      flexDirection="row"
      borderColor="green"
      backgroundColor={props.isSelected ? '#f3fdf5ff' : 'white'}
      alignItems="center"
      height={120}
      borderRadius={4}>
      <Stack alignItems="center" justifyContent="center" paddingHorizontal={12}>
        <Image
          source={{
            uri:
              getOrganizationLogo(props.voucher.event.organization) ??
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
              {props.voucher.discount_type === 'PERCENTAGE'
                ? props.voucher.discount_value
                : priceFormatV2(props.voucher.discount_value)}
              {props.voucher.discount_type === 'PERCENTAGE' ? '%' : ''}
            </Text>
            <Text fontSize={'$4'} color="#545252ff" numberOfLines={1}>
              Đơn tối thiểu {priceFormatV2(props.voucher.min_order_value!)}
            </Text>
          </YStack>

          <Stack
            justifyContent="center"
            alignItems="center"
            borderWidth={props.isSelected ? 0 : 1}
            height={16}
            width={16}
            borderColor="darkgray"
            backgroundColor={props.isSelected ? 'green' : 'transparent'}
            borderRadius={10}>
            {props.isSelected && <Check color={'white'} size={12} />}
          </Stack>
        </XStack>
        <YStack>
          <Text
            fontSize={'$3'}
            numberOfLines={1}
            color="#2f87dfff"
            onPress={() => {
              navigation.navigate(SCREENS.VOUCHER_DETAIL, props.voucher);
            }}>
            Xem chi tiết
          </Text>
          <Text fontSize={'$3'} color="#545252ff" numberOfLines={1}>
            HSD: {stringToDateFormatV3(props.voucher.valid_to)}
          </Text>
        </YStack>
      </YStack>
    </Stack>
  );
}
