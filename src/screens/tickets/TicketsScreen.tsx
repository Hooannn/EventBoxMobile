import React, {useCallback, useState} from 'react';
import {RefreshControl} from 'react-native';
import useAxios from '../../hooks/useAxios';
import {useQuery} from '@tanstack/react-query';
import {IResponseData, ITicketItemDetail} from '../../types';
import {
  ScrollView,
  Spinner,
  YStack,
  Text,
  Stack,
  XStack,
  Button,
} from 'tamagui';
import AppBar from '../../components/AppBar';
import PagerView from 'react-native-pager-view';
import TicketCard from './TicketCard';
import dayjs from '../../libs/dayjs';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../../navigation';

export default function TicketsScreen() {
  const axios = useAxios();

  const getMyTicketItemsQuery = useQuery({
    queryKey: ['fetch/tickets/items/me'],
    queryFn: () =>
      axios.get<IResponseData<ITicketItemDetail[]>>('/v1/tickets/items/me'),
    refetchOnWindowFocus: false,
  });

  const ticketItems = getMyTicketItemsQuery.data?.data?.data || [];

  const isLoading = getMyTicketItemsQuery.isLoading;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      Promise.all([getMyTicketItemsQuery.refetch()]);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [getMyTicketItemsQuery]);

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

  const navigation = useNavigation();

  const filterTicketItems = (status: string) => {
    return ticketItems.filter(ticketItem => {
      const eventShow = ticketItem.ticket.event_show;

      const now = dayjs();
      const startTime = dayjs(eventShow.start_time);
      const endTime = dayjs(eventShow.end_time);

      if (status === 'upcoming') {
        return startTime.isAfter(now);
      } else if (status === 'ongoing') {
        return startTime.isBefore(now) && endTime.isAfter(now);
      } else if (status === 'past') {
        return endTime.isBefore(now);
      }
      return false;
    });
  };

  const sortedTicketItems = (status: string) => {
    return filterTicketItems(status).sort((a, b) => {
      const aStartTime = dayjs(a.ticket.event_show.start_time);
      const bStartTime = dayjs(b.ticket.event_show.start_time);
      return aStartTime.isBefore(bStartTime) ? -1 : 1;
    });
  };

  const pagerViewRef = React.useRef<PagerView>(null);
  return (
    <YStack style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <AppBar>
        <Stack
          paddingTop={8}
          paddingBottom={8}
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          flex={1}>
          <Text color={'white'} fontWeight={700} fontSize={'$7'}>
            Vé của tôi
          </Text>
        </Stack>
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
                {sortedTicketItems(tab.key).length > 0 ? (
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
                    <YStack flex={1} width={'100%'} gap={8} paddingBottom={20}>
                      {sortedTicketItems(tab.key).map((ticketItem, i) => (
                        <TicketCard
                          key={'TicketCard' + i}
                          ticketItem={ticketItem}
                          onPress={() =>
                            navigation.navigate(SCREENS.TICKET_ITEM_DETAIL, {
                              ...ticketItem,
                              status: tab.key,
                            })
                          }
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
                    <Text>Không có vé nào</Text>
                  </YStack>
                )}
              </>
            ))}
          </PagerView>
        </>
      )}
    </YStack>
  );
}
