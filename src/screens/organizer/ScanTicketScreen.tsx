import React, {useCallback} from 'react';
import {Button, Stack, Text, XStack, YStack} from 'tamagui';
import AppBar from '../../components/AppBar';
import {useNavigation, useRoute} from '@react-navigation/native';
import {IEvent, IEventShow} from '../../types';
import {ChevronLeft} from '@tamagui/lucide-icons';
import {stringToDateFormatV2} from '../../utils';
import {
  Camera,
  Code,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {StyleSheet} from 'react-native';

export default function ScanTicketScreen() {
  const route = useRoute();
  const {event, show} = route.params as {
    event: IEvent;
    show: IEventShow;
  };

  const navigation = useNavigation();
  const device = useCameraDevice('back');

  const onCodeScanned = useCallback((codes: Code[]) => {
    console.log(`Scanned ${codes.length} codes:`, codes);
    const value = codes[0]?.value;
    console.log('Scanned value:', value);
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: onCodeScanned,
  });
  return (
    <YStack flex={1} justifyContent="center" alignItems="center">
      <AppBar>
        <XStack alignItems="flex-start" gap={8} width={'100%'}>
          <Button
            backgroundColor={'transparent'}
            variant="outlined"
            themeInverse
            circular
            onPress={() => navigation.goBack()}
            icon={<ChevronLeft size={20} />}
          />
          <YStack flex={1} width={'88%'}>
            <Text
              fontSize={'$7'}
              fontWeight="bold"
              color={'white'}
              width={'100%'}
              ellipsizeMode="tail"
              numberOfLines={1}>
              {event.title}
            </Text>
            <Text
              fontSize={'$5'}
              color={'$color2'}
              width={'100%'}
              marginTop={4}>
              Từ{' '}
              <Text color={'$color2'}>
                {stringToDateFormatV2(show.start_time)}
              </Text>
            </Text>
            <Text fontSize={'$5'} color={'$color2'} width={'100%'}>
              đến{' '}
              <Text color={'$color2'}>
                {stringToDateFormatV2(show.end_time)}
              </Text>
            </Text>
          </YStack>
        </XStack>
      </AppBar>

      <YStack
        flex={1}
        width={'100%'}
        alignItems="center"
        justifyContent="center">
        {device ? (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            codeScanner={codeScanner}
            isActive={true}
          />
        ) : (
          <Stack>
            <Text>No camera available</Text>
          </Stack>
        )}
      </YStack>
    </YStack>
  );
}
