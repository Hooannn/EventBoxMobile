import React, {PropsWithChildren, useState} from 'react';
import ImageView from 'react-native-image-viewing';
import {Stack} from 'tamagui';

export default function ImageViewProvider(
  props: {
    uri: string;
  } & PropsWithChildren,
) {
  const images = [
    {
      uri: props.uri,
    },
  ];
  const [visible, setIsVisible] = useState(false);
  return (
    <>
      <ImageView
        images={images}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
      />
      <Stack
        onPress={() => {
          setIsVisible(true);
        }}>
        {props.children}
      </Stack>
    </>
  );
}
