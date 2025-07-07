import React, {useRef} from 'react';
import {YStack, XStack, Image, Button, Spinner, Text, View} from 'tamagui';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Search} from '@tamagui/lucide-icons';
import useAxios from '../../hooks/useAxios';
import {IEvent, IResponseData} from '../../types';
import {useQuery} from '@tanstack/react-query';
import {useSharedValue} from 'react-native-reanimated';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import {Dimensions} from 'react-native';
const data = [...new Array(6).keys()];
const width = Dimensions.get('window').width;
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const ref = useRef<ICarouselInstance>(null);
  const axios = useAxios();

  const progress = useSharedValue<number>(0);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - progress.value,
      animated: true,
    });
  };

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

  const isLoading = getDiscoveryEventsQuery.isLoading;
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
          <YStack flex={1} width={'100%'}>
            <Carousel
              ref={ref}
              width={width}
              height={width / 2}
              data={data}
              onProgressChange={progress}
              renderItem={({index}) => (
                <View
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    justifyContent: 'center',
                  }}>
                  <Text style={{textAlign: 'center', fontSize: 30}}>
                    {index}
                  </Text>
                </View>
              )}
            />
            <Pagination.Basic
              progress={progress}
              data={data}
              dotStyle={{backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 50}}
              containerStyle={{gap: 5, marginTop: 10}}
              onPress={onPressPagination}
            />
          </YStack>
        )}
      </YStack>
    </>
  );
}
