import {useEffect, useState} from 'react';
import DateTimePicker, {
  DateTimePickerEvent,
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import {Sheet, XStack, Text, Stack, Button} from 'tamagui';
import dayjs from '../libs/dayjs';
import {Platform} from 'react-native';

interface UniversalDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

export default function UniversalDatePicker({
  value,
  onChange,
}: UniversalDatePickerProps) {
  const [shouldOpen, setShouldOpen] = useState(false);
  const [internalDate, setInternalDate] = useState<Date | null>(null);

  const onInternalChange = (_event: DateTimePickerEvent, date?: Date) => {
    setInternalDate(date || null);
  };

  const onAndroidChange = (_event: DateTimePickerEvent, date?: Date) => {
    onChange(date || null);
  };

  const onInputPress = () => {
    if (Platform.OS === 'ios') {
      setShouldOpen(true);
    } else {
      DateTimePickerAndroid.open({
        mode: 'date',
        display: 'spinner',
        value: internalDate ?? dayjs().toDate(),
        positiveButton: {label: 'Chọn'},
        negativeButton: {label: 'Huỷ'},
        timeZoneName: 'Asia/Ho_Chi_Minh',
        onChange: onAndroidChange,
      });
    }
  };

  useEffect(() => {
    setInternalDate(value);
  }, [value]);
  return (
    <>
      <Stack
        alignItems="center"
        paddingHorizontal="$4"
        paddingVertical="$2"
        borderWidth={1}
        borderRadius={4}
        pressStyle={{opacity: 0.8}}
        borderColor="$yellow11"
        onPress={onInputPress}>
        <Text color={value ? '$color' : '$gray11'}>
          {value ? dayjs(value).format('DD-MM-YYYY') : 'Chọn ngày'}
        </Text>
      </Stack>

      <>
        {Platform.OS === 'ios' && (
          <Sheet
            forceRemoveScrollEnabled={shouldOpen}
            modal
            snapPointsMode="fit"
            disableDrag
            unmountChildrenWhenHidden
            open={shouldOpen}
            onOpenChange={setShouldOpen}
            zIndex={200_000}
            animation="medium">
            <Sheet.Overlay
              animation="lazy"
              enterStyle={{opacity: 0}}
              exitStyle={{opacity: 0}}
            />

            <Sheet.Frame justifyContent="center" alignItems="center">
              <XStack
                alignItems="center"
                paddingTop="$2"
                paddingVertical={'$2'}>
                <Button
                  onPress={() => {
                    setShouldOpen(false);
                  }}
                  theme={'yellow_alt2'}
                  variant="outlined">
                  Huỷ
                </Button>
                <Text fontSize={'$5'} flex={1} textAlign="center">
                  Chọn ngày
                </Text>
                <Button
                  onPress={() => {
                    setShouldOpen(false);
                    onChange(internalDate ?? dayjs().toDate());
                  }}
                  theme={'accent'}
                  variant="outlined">
                  Chọn
                </Button>
              </XStack>
              <DateTimePicker
                onChange={onInternalChange}
                timeZoneName="Asia/Ho_Chi_Minh"
                locale="vi-VN"
                value={internalDate || dayjs().toDate()}
                style={{flex: 1}}
                testID="fromDateTimePicker"
                mode="date"
                display="spinner"
              />
            </Sheet.Frame>
          </Sheet>
        )}
      </>
    </>
  );
}
