import React from 'react';
import {Stack} from 'tamagui';

export default function BottomSheetBackdrop(props: {onPress: () => void}) {
  return (
    <Stack
      flex={1}
      backgroundColor="black"
      position="absolute"
      transition="opacity 200ms"
      zIndex={1}
      width={'100%'}
      height={'100%'}
      opacity={0.5}
      onPress={props.onPress}
    />
  );
}
