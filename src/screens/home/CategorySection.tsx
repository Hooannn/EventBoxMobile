import {Spinner, Stack, Text, YStack} from 'tamagui';
import {ICategory, IEvent, IResponseData} from '../../types';
import useAxios from '../../hooks/useAxios';
import {useQuery} from '@tanstack/react-query';
import {Ticket} from '@tamagui/lucide-icons';
import {FlatList} from 'react-native';
import EventCard from './EventCard';

export default function CategorySection(props: {category: ICategory}) {
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
    <YStack key={'FeaturedCategory' + props.category.id} gap={2}>
      <Text fontSize={'$5'} fontWeight={'700'}>
        {props.category.name_vi}
      </Text>
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
                marginBottom: 16,
                gap: 4,
              }}
              renderItem={({item}) => (
                <Stack
                  height={200}
                  flex={1}
                  key={'EventByCategoryEventCardInner' + item.id}>
                  <EventCard
                    showOverview
                    event={item}
                    onPress={(event: IEvent) => {}}
                  />
                </Stack>
              )}
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
