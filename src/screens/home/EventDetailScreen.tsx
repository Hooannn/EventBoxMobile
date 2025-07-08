import {useRoute} from '@react-navigation/native';
import {Text, Stack} from 'tamagui';
import {IEvent} from '../../types';
export default function EventDetailScreen() {
  const route = useRoute();
  const event = route.params as IEvent;
  return (
    <Stack>
      <Text>{JSON.stringify(event, null, 2)}</Text>
    </Stack>
  );
}
