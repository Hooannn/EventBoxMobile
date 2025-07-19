import React from 'react';
import {Card, Image, Stack, Text, View, XStack, YStack} from 'tamagui';
import {IEvent, ITicketItemDetail} from '../../types';
import {getEventLogo, stringToDateFormatV2} from '../../utils';
import dayjs from '../../libs/dayjs';

export default function TicketCard({
  ticketItem,
  onPress,
}: {
  ticketItem: ITicketItemDetail;
  onPress: () => void;
}) {
  return (
    <>
      <Card
        bordered
        animation="bouncy"
        backgroundColor={'white'}
        height={240}
        onPress={onPress}
        pressStyle={{
          transform: [{scale: 0.99}],
        }}>
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
            alignItems="center"
            paddingVertical={8}
            paddingHorizontal={24}
            justifyContent="space-between"
            gap={12}
            flexDirection="row">
            <Image
              borderRadius={4}
              resizeMode="cover"
              width={'50%'}
              height={'100%'}
              source={{
                uri: getEventLogo(ticketItem.ticket.event_show.event as IEvent),
              }}
            />

            <Stack
              flex={1}
              flexDirection="column"
              justifyContent="center"
              alignItems="center">
              <Text fontWeight={800} textAlign="center">
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
              gap={8}
              paddingHorizontal={24}
              paddingVertical={8}>
              <XStack justifyContent="space-between" gap={16}>
                <YStack width={'50%'}>
                  <Text fontSize={'$3'}>Địa điểm</Text>
                  <Text fontWeight={700} fontSize={'$2'}>
                    {ticketItem.ticket.event_show.event.place_name}
                  </Text>
                </YStack>
                <YStack width={'50%'}>
                  <Text fontSize={'$3'}>Thời gian diễn ra</Text>
                  <Text fontWeight={700} fontSize={'$2'}>
                    Từ{' '}
                    {stringToDateFormatV2(
                      ticketItem.ticket.event_show.start_time,
                    )}
                  </Text>
                  <Text fontWeight={700} fontSize={'$2'}>
                    đến{' '}
                    {stringToDateFormatV2(
                      ticketItem.ticket.event_show.end_time,
                    )}
                  </Text>
                </YStack>
              </XStack>
              <XStack justifyContent="space-between" gap={16}>
                <YStack width={'50%'}>
                  <Text fontSize={'$3'}>Loại vé</Text>
                  <Text fontWeight={700} fontSize={'$2'}>
                    {ticketItem.ticket.name}
                  </Text>
                </YStack>
                <YStack width={'50%'}>
                  <Text fontSize={'$3'}>Trạng thái</Text>
                  <Text fontWeight={700} fontSize={'$2'}>
                    {ticketItem.traces && ticketItem.traces.length > 0
                      ? ticketItem.traces[ticketItem.traces.length - 1]
                          .event === 'CHECKED_IN'
                        ? `Check-in lúc ${dayjs(
                            ticketItem.traces[ticketItem.traces.length - 1]
                              .created_at,
                          ).format('HH:mm, DD/MM/YYYY')}`
                        : `Ra ngoài lúc ${dayjs(
                            ticketItem.traces[ticketItem.traces.length - 1]
                              .created_at,
                          ).format('HH:mm, DD/MM/YYYY')}`
                      : 'Chưa sử dụng'}
                  </Text>
                </YStack>
              </XStack>
            </YStack>
          </Stack>
        </YStack>
      </Card>
    </>
  );
}
