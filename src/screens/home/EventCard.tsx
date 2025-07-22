import React from 'react';
import {IEvent} from '../../types';
import {Card, Image, Text, XStack, YStack} from 'tamagui';
import {Calendar} from '@tamagui/lucide-icons';
import {
  getEventLogo,
  getFirstShowStartTimeV2,
  getMinimumShowTicketPrice,
  priceFormat,
} from '../../utils';

export default function EventCard(props: {
  event: IEvent;
  onPress: (event: IEvent) => void;
  showOverview: boolean;
}) {
  return (
    <YStack
      flex={1}
      gap={4}
      backgroundColor={'white'}
      borderRadius={'$3'}
      onPress={() => props.onPress(props.event)}>
      <Card
        borderRadius={props.showOverview ? '$3' : 0}
        bordered={false}
        animation="bouncy"
        elevation={0}
        elevate={false}
        flex={1}
        justifyContent="center">
        <Card.Background>
          <Image
            borderRadius={props.showOverview ? '$3' : 0}
            resizeMode="cover"
            width={'100%'}
            height={'100%'}
            source={{
              uri: getEventLogo(props.event),
            }}
          />
        </Card.Background>
      </Card>
      {props.showOverview && (
        <YStack width={'100%'} padding={'$2'}>
          <Text height={38} fontWeight={700} fontSize={'$3'}>
            {props.event.title}
          </Text>
          <XStack alignItems="center" gap={4}>
            <Text color={'green'}>Từ</Text>
            <Text fontWeight={700} fontSize={'$4'} color={'green'}>
              {priceFormat(getMinimumShowTicketPrice(props.event) || 0)}
            </Text>
          </XStack>

          <XStack alignItems="center" gap={4}>
            <Calendar size={14} />
            <Text fontSize={'$3'}>{getFirstShowStartTimeV2(props.event)}</Text>
          </XStack>
        </YStack>
      )}
    </YStack>
  );
}
