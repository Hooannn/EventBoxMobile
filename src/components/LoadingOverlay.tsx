import {Spinner, Stack, ZStack} from 'tamagui';
export default function LoadingOverlay() {
  return (
    <ZStack
      zIndex={999}
      animation={'100ms'}
      fullscreen
      backgroundColor={'rgba(0,0,0,0.3)'}>
      <Stack alignItems="center" justifyContent="center" flex={1}>
        <Spinner size="large" />
      </Stack>
    </ZStack>
  );
}
