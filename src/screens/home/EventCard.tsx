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
    <YStack flex={1} gap={4}>
      <Card
        bordered={false}
        borderRadius={0}
        animation="bouncy"
        elevation={0}
        elevate={false}
        hoverStyle={{scale: 0.98}}
        pressStyle={{scale: 0.98}}
        flex={1}
        onPress={() => props.onPress(props.event)}
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
        <YStack width={'100%'}>
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
