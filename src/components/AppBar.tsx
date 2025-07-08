import React, {PropsWithChildren} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {XStack} from 'tamagui';

export default function AppBar(props: PropsWithChildren) {
  const insets = useSafeAreaInsets();

  return (
    <XStack
      width={'100%'}
      backgroundColor={'#262626'}
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={'$4'}
      paddingBottom={'$3'}
      paddingTop={insets.top}>
      {props.children}
    </XStack>
  );
}
