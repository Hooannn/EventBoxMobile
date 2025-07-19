import {useNavigation, useRoute} from '@react-navigation/native';
import {
  Text,
  ScrollView,
  YStack,
  XStack,
  Button,
  Spinner,
  Input,
} from 'tamagui';
import {IEvent, IEventShow, IOrganization, IResponseData} from '../../types';
import {RefreshControl} from 'react-native';
import AppBar from '../../components/AppBar';
import {useCallback, useState} from 'react';
import React from 'react';
import useAxios from '../../hooks/useAxios';
import {useQuery} from '@tanstack/react-query';
import {ChevronLeft, Filter} from '@tamagui/lucide-icons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import PagerView from 'react-native-pager-view';
import dayjs from '../../libs/dayjs';
import EventCardWithShows from './EventCardWithShows';

export default function OrganizationScreen() {
  const route = useRoute();
  const organization = route.params as IOrganization;
  const axios = useAxios();

  const getEventsQuery = useQuery({
    queryKey: ['fetch/event/organization/id/published', organization.id],
    queryFn: () =>
      axios.get<IResponseData<IEvent[]>>(
        `/v1/events/organization/${organization.id}/published`,
      ),
    refetchOnWindowFocus: false,
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getEventsQuery.refetch().finally(() => {
      setRefreshing(false);
    });
  }, [getEventsQuery]);

  const navigation = useNavigation();

  const events = getEventsQuery.data?.data?.data || [];

  const isLoading = getEventsQuery.isLoading;

  const pagerViewRef = React.useRef<PagerView>(null);

  const [tabIndex, setTabIndex] = useState(0);

  const tabs = () => [
    {
      title: 'Sắp diễn ra',
      key: 'upcoming',
    },
    {
      title: 'Đang diễn ra',
      key: 'ongoing',
    },
    {
      title: 'Đã qua',
      key: 'past',
    },
  ];

  const flateredEventShows = () => {
    return events.reduce<IEventShow[]>((acc, event) => {
      if (event.shows) {
        const shows = event.shows.map(show => ({
          ...show,
          event_id: event.id,
        }));
        acc.push(...shows);
      }
      return acc;
    }, []);
  };

  const filterEventShows = (status: string) => {
    const flateredShows = flateredEventShows();
    const result = flateredShows.filter(show => {
      const now = dayjs();
      const startTime = dayjs(show.start_time);
      const endTime = dayjs(show.end_time);
      if (status === 'upcoming') {
        return startTime.isAfter(now);
      } else if (status === 'ongoing') {
        return startTime.isBefore(now) && endTime.isAfter(now);
      } else if (status === 'past') {
        return endTime.isBefore(now);
      }
      return false;
    });
    return result;
  };

  const sortedEventShows = (status: string) => {
    return filterEventShows(status).sort((a, b) => {
      return dayjs(a.start_time).isBefore(dayjs(b.start_time)) ? -1 : 1;
    });
  };

  const getEventShowsByEventId = (status: string, eventId: number) => {
    const result = sortedEventShows(status).filter(
      show => show.event_id === eventId,
    );
    return result;
  };

  const filterEvents = (status: string) => {
    return events.filter(event => {
      const shows = getEventShowsByEventId(status, event.id);
      return shows.length > 0;
    });
  };

  return (
    <KeyboardAwareScrollView
      enableOnAndroid
      contentContainerStyle={{flexGrow: 1}}>
      <YStack style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <AppBar>
          <XStack alignItems="center" gap={8} width={'100%'}>
            <Button
              backgroundColor={'transparent'}
              variant="outlined"
              themeInverse
              circular
              onPress={() => navigation.goBack()}
              icon={<ChevronLeft size={20} />}
            />
            <Text
              fontSize={'$7'}
              fontWeight="bold"
              color={'white'}
              width={'88%'}
              ellipsizeMode="tail"
              numberOfLines={1}>
              {organization.name}
            </Text>
          </XStack>
        </AppBar>

        {isLoading ? (
          <YStack
            flex={1}
            width={'100%'}
            alignItems="center"
            justifyContent="center">
            <Spinner size="large" />
          </YStack>
        ) : (
          <>
            <XStack
              width={'100%'}
              alignItems="center"
              paddingTop={8}
              paddingBottom={4}
              paddingHorizontal={16}
              gap={4}
              justifyContent="space-between">
              <Input height={50} flex={1} placeholder="Tìm kiếm..." />
              <Button height={50} icon={Filter} />
            </XStack>
            <XStack
              width={'100%'}
              alignItems="center"
              paddingVertical={4}
              paddingHorizontal={16}
              justifyContent="space-between">
              {tabs().map((tab, index) => (
                <Button
                  key={'Tab' + tab.key}
                  width={'33%'}
                  theme={tabIndex === index ? 'accent' : 'default'}
                  onPress={() => {
                    setTabIndex(index);
                    pagerViewRef.current?.setPage(index);
                  }}>
                  <Text>{tab.title}</Text>
                </Button>
              ))}
            </XStack>
            <PagerView
              ref={pagerViewRef}
              style={{
                flex: 1,
                width: '100%',
              }}
              onPageSelected={e => {
                setTabIndex(e.nativeEvent.position);
              }}
              initialPage={0}>
              {tabs().map((tab, index) => (
                <>
                  {filterEvents(tab.key).length > 0 ? (
                    <ScrollView
                      key={'ScrollView' + tab.key + index}
                      paddingTop={8}
                      paddingHorizontal={16}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}
                      flexGrow={1}
                      width={'100%'}
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={onRefresh}
                        />
                      }>
                      <YStack
                        flex={1}
                        width={'100%'}
                        gap={8}
                        paddingBottom={20}>
                        {filterEvents(tab.key).map((event, i) => (
                          <EventCardWithShows
                            status={tab.key}
                            key={'EventCard' + i + event.id}
                            event={event}
                            shows={getEventShowsByEventId(tab.key, event.id)}
                          />
                        ))}
                      </YStack>
                    </ScrollView>
                  ) : (
                    <YStack
                      key={'ScrollView' + tab.key + index}
                      flex={1}
                      width={'100%'}
                      alignItems="center"
                      justifyContent="center">
                      <Text>Không có sự kiện nào</Text>
                    </YStack>
                  )}
                </>
              ))}
            </PagerView>
          </>
        )}
      </YStack>
    </KeyboardAwareScrollView>
  );
}
