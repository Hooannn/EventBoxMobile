import React from 'react';
import {IEvent, IEventShow} from '../../types';
import {
  Button,
  Card,
  Image,
  Separator,
  Stack,
  Text,
  XStack,
  YStack,
} from 'tamagui';
import {getEventLogo, stringToDateFormatV2} from '../../utils';
import {ScanQrCode} from '@tamagui/lucide-icons';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../../navigation';

export default function EventCardWithShows(props: {
  event: IEvent;
  shows: IEventShow[];
  status: string;
}) {
  const navigation = useNavigation();
  return (
    <Card
      backgroundColor={'white'}
      width={'100%'}
      borderRadius={0}
      padding={16}
      bordered={false}
      elevation={0}
      elevate={false}
      flex={1}
      justifyContent="center">
      <YStack width={'100%'} gap={2}>
        <Text fontWeight={700} fontSize={'$6'}>
          {props.event.title}
        </Text>
        <Image
          marginVertical={4}
          alignSelf="center"
          borderRadius={'$3'}
          resizeMode="cover"
          width={'60%'}
          height={120}
          source={{
            uri: getEventLogo(props.event),
          }}
        />
        <XStack alignItems="center">
          <Text width={'20%'}>Địa điểm: </Text>
          <Text fontWeight={700} fontSize={'$4'} flex={1} width={'100%'}>
            {props.event.place_name}
          </Text>
        </XStack>
        <XStack>
          <Text width={'20%'}>Địa chỉ: </Text>
          <Text fontWeight={700} fontSize={'$4'} flex={1} width={'100%'}>
            {props.event.address}
          </Text>
        </XStack>
        <Separator marginVertical={8} />
        <Text fontWeight={700} fontSize={'$5'}>
          Danh sách các buổi diễn:
        </Text>
        <YStack width={'100%'} gap={8} flex={1}>
          {props.shows.map((show, index) => (
            <XStack
              key={'EventShow' + index + props.event.id}
              alignItems="center">
              <YStack flex={1} width={'100%'}>
                <Text fontSize={'$4'} flex={1} width={'100%'}>
                  Từ{' '}
                  <Text fontWeight={700}>
                    {stringToDateFormatV2(show.start_time)}
                  </Text>
                </Text>
                <Text fontSize={'$4'} flex={1} width={'100%'}>
                  Đến{' '}
                  <Text fontWeight={700}>
                    {stringToDateFormatV2(show.end_time)}
                  </Text>
                </Text>
              </YStack>
              <Stack alignItems="center">
                {props.status === 'ongoing' ? (
                  <Button
                    paddingHorizontal={24}
                    borderRadius={0}
                    icon={ScanQrCode}
                    onPress={() => {
                      navigation.navigate(SCREENS.SCAN_TICKET, {
                        event: props.event,
                        show: show,
                      });
                    }}
                    theme={'accent'}>
                    Quét vé
                  </Button>
                ) : (
                  <>
                    {props.status === 'upcoming' ? (
                      <Text color="$green10">Sắp diễn ra</Text>
                    ) : (
                      <Text color="$red10">Đã kết thúc</Text>
                    )}
                  </>
                )}
              </Stack>
            </XStack>
          ))}
        </YStack>
      </YStack>
    </Card>
  );
}
