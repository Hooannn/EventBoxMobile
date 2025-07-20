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
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import {StyleSheet} from 'react-native';
import ScannerOverlay from '../../components/ScannerOverlay';
import {SCREENS} from '../../navigation';

export default function ScanTicketScreen() {
  const route = useRoute();
  const {event, show} = route.params as {
    event: IEvent;
    show: IEventShow;
  };
  const navigation = useNavigation();
  const device = useCameraDevice('back');

  const onCodeScanned = useCallback((codes: Code[]) => {
    const qr = codes.find(code => code.type === 'qr');
    const qrValue = qr?.value;
    if (qrValue) {
      navigation.navigate(SCREENS.SCAN_TICKET_RESULT, {
        token: qrValue,
        eventShowId: show.id,
      });
    }
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: onCodeScanned,
  });

  const [scanArea, setScanArea] = React.useState({
    width: 0,
    height: 0,
  });

  const {hasPermission, requestPermission} = useCameraPermission();

  if (!hasPermission) {
    requestPermission();
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text>No camera permission granted</Text>
        <Button onPress={() => requestPermission()} marginTop={16}>
          Grant Permission
        </Button>
      </YStack>
    );
  }

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
        onLayout={e => {
          const {width, height} = e.nativeEvent.layout;
          setScanArea({width, height});
        }}
        flex={1}
        width={'100%'}
        alignItems="center"
        justifyContent="center">
        {device ? (
          <>
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              codeScanner={codeScanner}
              isActive={true}
            />
            <ScannerOverlay
              parentWidth={scanArea.width}
              parentHeight={scanArea.height}
            />
          </>
        ) : (
          <Stack>
            <Text>No camera available</Text>
          </Stack>
        )}
      </YStack>
    </YStack>
  );
}
