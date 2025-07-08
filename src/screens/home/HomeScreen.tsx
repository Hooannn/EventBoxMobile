import React, {useRef} from 'react';
import {
  YStack,
  XStack,
  Image,
  Button,
  Spinner,
  Text,
  Stack,
  ScrollView,
} from 'tamagui';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Search} from '@tamagui/lucide-icons';
import useAxios from '../../hooks/useAxios';
import {ICategory, IEvent, IResponseData} from '../../types';
import {useQuery} from '@tanstack/react-query';
import {useSharedValue} from 'react-native-reanimated';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import {Dimensions, FlatList} from 'react-native';
import EventCard from './EventCard';
import {ArrowRightToLine} from '@tamagui/lucide-icons';
import CategorySection from './CategorySection';
import {useNavigation} from '@react-navigation/native';
const width = Dimensions.get('window').width;
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const ref = useRef<ICarouselInstance>(null);
  const axios = useAxios();

  const progress = useSharedValue<number>(0);

  const onEventCardPress = (event: IEvent) => {
    navigation.navigate('EventDetail', event);
  };

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const getFeaturedCategoriesQuery = useQuery({
    queryKey: ['fetch/categories/featured'],
    queryFn: () =>
      axios.get<IResponseData<ICategory[]>>('/v1/categories/featured'),
    refetchOnWindowFocus: false,
  });

  const featuredCategories = getFeaturedCategoriesQuery.data?.data?.data || [];

  const getDiscoveryEventsQuery = useQuery({
    queryKey: ['fetch/event/discovery'],
    queryFn: () =>
      axios.get<
        IResponseData<{
          featured_events: IEvent[];
          trending_events: IEvent[];
          latest_events: IEvent[];
        }>
      >('/v1/events/discovery'),
    refetchOnWindowFocus: false,
  });

  const getDiscoveryEventsData = getDiscoveryEventsQuery.data?.data?.data;

  const featuredEvents = getDiscoveryEventsData?.featured_events || [];
  const trendingEvents = getDiscoveryEventsData?.trending_events || [];
  const latestEvents = getDiscoveryEventsData?.latest_events || [];

  const isLoading =
    getDiscoveryEventsQuery.isLoading || getFeaturedCategoriesQuery.isLoading;
  return (
    <>
      <YStack style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <XStack
          width={'100%'}
          backgroundColor={'#262626'}
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal={'$4'}
          paddingBottom={'$3'}
          paddingTop={insets.top}>
          <Image
            source={{
              width: 160,
              height: 30,
              uri: require('../../assets/event_text.png'),
            }}
          />
          <Button
            backgroundColor={'transparent'}
            theme={'accent'}
            circular
            icon={<Search size={24} />}></Button>
        </XStack>
        {isLoading ? (
          <YStack
            flex={1}
            width={'100%'}
            alignItems="center"
            justifyContent="center">
            <Spinner size="large" />
          </YStack>
        ) : (
          <ScrollView flexGrow={1}>
            <YStack flex={1} width={'100%'} paddingBottom={20}>
              {featuredEvents.length > 0 && (
                <>
                  <Carousel
                    ref={ref}
                    width={width}
                    height={width / 2}
                    data={featuredEvents}
                    onProgressChange={progress}
                    autoPlay
                    autoPlayInterval={5000}
                    loop
                    renderItem={({item}) => (
                      <EventCard
                        showOverview={false}
                        key={'FeaturedEventCard' + item.id}
                        event={item}
                        onPress={onEventCardPress}
                      />
                    )}
                  />
                  <Pagination.Basic
                    progress={progress}
                    data={featuredEvents}
                    dotStyle={{
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: 50,
                    }}
                    containerStyle={{gap: 5, marginTop: 10}}
                    onPress={onPressPagination}
                  />
                </>
              )}

              <YStack width={'100%'} paddingHorizontal={'$3'} gap={32}>
                {trendingEvents.length > 0 && (
                  <YStack gap={5}>
                    <Text fontSize={'$5'} fontWeight={'700'}>
                      Sự kiện xu hướng
                    </Text>
                    <FlatList
                      data={trendingEvents}
                      horizontal
                      keyExtractor={item => 'TrendingEventCard' + item.id}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{
                        gap: 10,
                      }}
                      renderItem={({item}) => (
                        <Stack
                          height={230}
                          width={(width / 3) * 2 - 20}
                          key={'TrendingEventCardInner' + item.id}>
                          <EventCard
                            showOverview
                            event={item}
                            onPress={onEventCardPress}
                          />
                        </Stack>
                      )}
                    />
                  </YStack>
                )}

                {latestEvents.length > 0 && (
                  <YStack>
                    <Text fontSize={'$5'} fontWeight={'700'}>
                      Chuẩn bị diễn ra
                    </Text>
                    <FlatList
                      data={latestEvents}
                      horizontal
                      keyExtractor={item => 'UpcomingEventCard' + item.id}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{
                        gap: 10,
                      }}
                      renderItem={({item}) => (
                        <Stack
                          height={230}
                          width={(width / 3) * 2 - 20}
                          key={'UpcomingEventCardInner' + item.id}>
                          <EventCard
                            showOverview
                            event={item}
                            onPress={onEventCardPress}
                          />
                        </Stack>
                      )}
                    />
                  </YStack>
                )}

                {featuredCategories.length > 0 && (
                  <>
                    {featuredCategories.map(category => (
                      <CategorySection
                        key={'FeaturedCategory' + category.id}
                        category={category}
                      />
                    ))}
                  </>
                )}
              </YStack>

              <YStack
                width={'100%'}
                paddingHorizontal={'$3'}
                gap={5}
                alignItems="center">
                <Image
                  source={{
                    width: 100,
                    height: 100,
                    uri: require('../../assets/explore_v2.png'),
                  }}
                />
                <Text>Vẫn chưa tìm thấy sự kiện nào phù hợp? </Text>
                <Button
                  theme={'accent'}
                  borderRadius={0}
                  width={'auto'}
                  marginHorizontal={'auto'}
                  iconAfter={<ArrowRightToLine />}
                  onPress={() => {
                    // Handle "Xem tất cả" button press
                    console.log('Xem tất cả pressed');
                  }}>
                  Khám phá thêm sự kiện và thể loại khác
                </Button>
              </YStack>
            </YStack>
          </ScrollView>
        )}
      </YStack>
    </>
  );
}
