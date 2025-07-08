import {Button, Spinner, Stack, Text, XStack, YStack} from 'tamagui';
import {ICategory, IEvent, IResponseData} from '../../types';
import useAxios from '../../hooks/useAxios';
import {useQuery} from '@tanstack/react-query';
import {Ticket, ChevronRight} from '@tamagui/lucide-icons';
import {FlatList} from 'react-native';
import EventCard from './EventCard';

export default function CategorySection(props: {
  category: ICategory;
  onPress: (event: IEvent) => void;
}) {
  const axios = useAxios();

  const getEventsQuery = useQuery({
    queryKey: ['fetch/event/categories/featured', props.category.id],
    queryFn: () =>
      axios.get<IResponseData<IEvent[]>>(
        `/v1/events/categories/${props.category.id}`,
      ),
    refetchOnWindowFocus: false,
  });

  const events = getEventsQuery.data?.data?.data || [];

  return (
    <YStack key={'FeaturedCategory' + props.category.id} gap={5}>
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontSize={'$5'} fontWeight={'700'}>
          {props.category.name_vi}
        </Text>
        <Button
          opacity={0.8}
          backgroundColor={'transparent'}
          size="$3"
          iconAfter={<ChevronRight size={16} />}>
          Xem thêm
        </Button>
      </XStack>

      {getEventsQuery.isLoading ? (
        <Stack paddingVertical={40}>
          <Spinner />
        </Stack>
      ) : (
        <>
          {events.length > 0 ? (
            <FlatList
              data={events}
              numColumns={2}
              keyExtractor={item => `EventByCategory-${item.id}`}
              columnWrapperStyle={{
                justifyContent: 'space-between',
                marginBottom: 12,
                gap: 4,
              }}
              renderItem={({item}) => {
                return (
                  <Stack
                    height={200}
                    width={'50%'}
                    key={'EventByCategoryEventCardInner' + item.id}>
                    <EventCard
                      showOverview
                      event={item}
                      onPress={props.onPress}
                    />
                  </Stack>
                );
              }}
            />
          ) : (
            <Stack paddingVertical={20} alignItems="center" gap={4}>
              <Ticket size={40} color={'grey'} opacity={0.5} />
              <Text fontSize={'$2'}>Không có sự kiện nào</Text>
            </Stack>
          )}
        </>
      )}
    </YStack>
  );
}
