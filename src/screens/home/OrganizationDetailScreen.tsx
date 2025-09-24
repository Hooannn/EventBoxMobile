import {useNavigation, useRoute} from '@react-navigation/native';
import {
  Text,
  ScrollView,
  YStack,
  Button,
  XStack,
  Avatar,
  Paragraph,
  Spinner,
  Card,
  Stack,
} from 'tamagui';
import {
  IEvent,
  IOrganization,
  IResponseData,
  ITicketItemDetail,
  IUser,
} from '../../types';
import {FlatList, RefreshControl, useWindowDimensions} from 'react-native';
import AppBar from '../../components/AppBar';
import {
  Calendar,
  ChevronLeft,
  Group,
  Plus,
  Ticket,
  UserCircle,
} from '@tamagui/lucide-icons';
import {useCallback, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React from 'react';
import useAxios from '../../hooks/useAxios';
import {useMutation, useQuery} from '@tanstack/react-query';
import LoadingOverlay from '../../components/LoadingOverlay';
import {
  getMessage,
  getOrganizationLogo,
  getUserAvatar,
  isSubsribed,
} from '../../utils';
import useAuthStore from '../../store/auth.store';
import useToast from '../../hooks/useToast';
import dayjs from '../../libs/dayjs';
import EventCard from './EventCard';
import {SCREENS} from '../../navigation';

export default function OrganizationDetailScreen() {
  const {toast, toastOnError} = useToast();
  const route = useRoute();
  const {id: organizationId} = route.params as IOrganization;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const axios = useAxios();
  const authUser = useAuthStore(state => state.user);
  const setAuthUser = useAuthStore(state => state.setUser);

  const getEventsQuery = useQuery({
    queryKey: ['fetch/event/organization/id/published', organizationId],
    queryFn: () =>
      axios.get<IResponseData<IEvent[]>>(
        `/v1/events/organization/${organizationId}/published`,
      ),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const getFeedbackQuery = useQuery({
    queryKey: ['fetch/ticketItem/feedback/organization/id', organizationId],
    queryFn: () =>
      axios.get<IResponseData<ITicketItemDetail[]>>(
        `/v1/tickets/items/feedback/organizations/${organizationId}`,
      ),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const getOrganizationQuery = useQuery({
    queryKey: ['fetch/organizationDetails/id', organizationId],
    queryFn: () =>
      axios.get<
        IResponseData<{
          organization: IOrganization;
          subscribers_count: number;
          events_count: number;
        }>
      >(`/v1/organizations/${organizationId}/details`),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getOrganizationQuery.refetch().finally(() => {
      setRefreshing(false);
    });
  }, [getOrganizationQuery]);

  const organizationDetails = getOrganizationQuery.data?.data?.data;
  const organization = organizationDetails?.organization;

  const events = getEventsQuery.data?.data?.data || [];
  const ticketItemsFeedback = getFeedbackQuery.data?.data?.data || [];

  const subsribed = () =>
    isSubsribed(organizationDetails?.organization, authUser);

  const subscribeMutation = useMutation({
    mutationFn: () =>
      axios.post<IResponseData<boolean>>(
        `/v1/organizations/${organizationId}/subscribe`,
      ),
    onError: toastOnError,
    onSuccess: res => {
      toast.show('Thành công!', {
        message: getMessage(res.data.message) ?? 'Thao tác thành công',
        customData: {
          theme: 'green',
        },
      });
      getUserInfoMutation.mutate();
      getOrganizationQuery.refetch();
    },
  });

  const getUserInfoMutation = useMutation({
    mutationFn: () => axios.get<IResponseData<IUser>>(`/v1/users/me`),
    onSuccess: res => {
      setAuthUser(res.data.data);
    },
  });

  const isLoading =
    subscribeMutation.isPending || getUserInfoMutation.isPending;

  const handleSubscribe = () => {
    subscribeMutation.mutate();
  };

  const [tabIndex, setTabIndex] = useState(0);

  const tabs = () => [
    {
      title: 'Phát hành',
      key: 'ongoing',
    },
    {
      title: 'Kết thúc',
      key: 'past',
    },
  ];

  const getCurrentTab = () => {
    return tabs()[tabIndex].key as 'ongoing' | 'past';
  };

  const getEventsByTab = (tab: 'ongoing' | 'past') => {
    const now = dayjs();
    let eventsByStatus = [];
    if (tab === 'past') {
      eventsByStatus = events.filter(event =>
        event.shows.every(show => dayjs(show.end_time).isBefore(now)),
      );
    } else {
      eventsByStatus = events.filter(event =>
        event.shows.some(
          show =>
            dayjs(show.end_time).isAfter(now) ||
            dayjs(show.end_time).isSame(now),
        ),
      );
    }

    return eventsByStatus;
  };

  const countByTab = (tab: 'ongoing' | 'past') => {
    return getEventsByTab(tab).length;
  };

  const {width} = useWindowDimensions();
  return (
    <>
      {getOrganizationQuery.isLoading ? (
        <LoadingOverlay />
      ) : (
        <>
          {organization ? (
            <>
              {isLoading && <LoadingOverlay />}
              <YStack
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <AppBar>
                  <XStack alignItems="center" gap={8}>
                    <Button
                      backgroundColor={'transparent'}
                      variant="outlined"
                      themeInverse
                      circular
                      onPress={() => navigation.goBack()}
                      icon={<ChevronLeft size={20} />}
                    />
                    <Text fontSize={'$7'} fontWeight="bold" color={'white'}>
                      Ban tổ chức
                    </Text>
                  </XStack>
                </AppBar>

                <ScrollView
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
                    gap={16}
                    paddingTop={16}
                    paddingHorizontal={16}
                    paddingBottom={insets.bottom + 16}>
                    <XStack alignItems="center" gap={16}>
                      <Avatar size="$8" borderRadius={12}>
                        <Avatar.Image src={getOrganizationLogo(organization)} />
                        <Avatar.Fallback
                          backgroundColor={'gray'}
                          alignItems="center"
                          justifyContent="center">
                          <Group size={40} color={'white'} />
                        </Avatar.Fallback>
                      </Avatar>
                      <YStack gap={8} flex={1}>
                        <Text fontSize={'$8'} fontWeight={'700'}>
                          {organization.name}
                        </Text>
                        <XStack
                          alignItems="center"
                          justifyContent="space-between">
                          <XStack alignItems="center" gap={4}>
                            <Calendar size={18} color="#666" />
                            <YStack>
                              <Text fontSize={'$4'} color={'#666'}>
                                Thành lập
                              </Text>
                              <Text fontSize={'$4'} color={'#666'}>
                                {new Date(
                                  organization.created_at,
                                ).getFullYear()}
                              </Text>
                            </YStack>
                          </XStack>

                          <XStack alignItems="center" gap={4}>
                            <Ticket size={18} color="#666" />
                            <YStack>
                              <Text fontSize={'$4'} color={'#666'}>
                                {organizationDetails?.events_count || 0}
                              </Text>
                              <Text fontSize={'$4'} color={'#666'}>
                                Sự kiện
                              </Text>
                            </YStack>
                          </XStack>

                          <XStack alignItems="center" gap={4}>
                            <UserCircle size={18} color="#666" />
                            <YStack>
                              <Text fontSize={'$4'} color={'#666'}>
                                {organizationDetails?.subscribers_count || 0}
                              </Text>
                              <Text fontSize={'$4'} color={'#666'}>
                                Theo dõi
                              </Text>
                            </YStack>
                          </XStack>
                        </XStack>
                      </YStack>
                    </XStack>

                    <Paragraph fontSize={'$5'} color={'#5c5c5cff'}>
                      {organization.description}
                    </Paragraph>

                    <Button
                      onPress={handleSubscribe}
                      borderRadius={0}
                      height={52}
                      themeInverse={subsribed()}
                      theme={subsribed() ? 'red' : 'accent'}
                      icon={subsribed() ? undefined : <Plus />}>
                      {subsribed() ? 'Bỏ theo dõi' : 'Theo dõi'}
                    </Button>

                    <YStack gap={8}>
                      <Text fontSize={'$6'} fontWeight="700">
                        Sự kiện từ ban tổ chức
                      </Text>
                      <XStack
                        width={'100%'}
                        alignItems="center"
                        justifyContent="space-between">
                        {tabs().map((tab, index) => (
                          <Button
                            key={'OrganizationDetailEventTab' + tab.key}
                            width={'49%'}
                            theme={tabIndex === index ? 'accent' : 'default'}
                            onPress={() => {
                              setTabIndex(index);
                            }}>
                            <Text>
                              {tab.title} (
                              {countByTab(tab.key as 'ongoing' | 'past')})
                            </Text>
                          </Button>
                        ))}
                      </XStack>

                      {getEventsQuery.isLoading ? (
                        <YStack
                          width={'100%'}
                          alignItems="center"
                          justifyContent="center"
                          paddingVertical={32}>
                          <Spinner size="large" />
                        </YStack>
                      ) : (
                        <>
                          {getEventsByTab(getCurrentTab()).length === 0 ? (
                            <Card padding={12} bordered backgroundColor="white">
                              <XStack
                                alignItems="center"
                                justifyContent="center"
                                gap={12}
                                paddingVertical={24}>
                                <Text
                                  textAlign="center"
                                  fontSize={'$4'}
                                  color="#666">
                                  Không có sự kiện nào.
                                </Text>
                              </XStack>
                            </Card>
                          ) : (
                            <FlatList
                              data={getEventsByTab(getCurrentTab())}
                              horizontal
                              keyExtractor={item =>
                                'OrganizationDetailEventCard' + item.id
                              }
                              showsHorizontalScrollIndicator={false}
                              contentContainerStyle={{
                                gap: 10,
                              }}
                              renderItem={({item}) => (
                                <Stack
                                  height={230}
                                  width={(width / 3) * 2 - 20}
                                  key={
                                    'OrganizationDetailEventCardInner' + item.id
                                  }>
                                  <EventCard
                                    showOverview
                                    event={item}
                                    onPress={e => {
                                      navigation.navigate(
                                        SCREENS.EVENT_DETAIL,
                                        {id: e.id},
                                      );
                                    }}
                                  />
                                </Stack>
                              )}
                            />
                          )}
                        </>
                      )}
                    </YStack>

                    <YStack gap={8} marginTop={16}>
                      <Text fontSize={'$6'} fontWeight="700">
                        Người dùng nói gì
                      </Text>

                      {getFeedbackQuery.isLoading ? (
                        <YStack
                          width={'100%'}
                          alignItems="center"
                          justifyContent="center"
                          paddingVertical={32}>
                          <Spinner size="large" />
                        </YStack>
                      ) : (
                        <>
                          {ticketItemsFeedback.length === 0 ? (
                            <Card padding={12} bordered backgroundColor="white">
                              <XStack
                                alignItems="center"
                                justifyContent="center"
                                gap={12}
                                paddingVertical={24}>
                                <Text
                                  textAlign="center"
                                  fontSize={'$4'}
                                  color="#666">
                                  Chưa có phản hồi nào.
                                </Text>
                              </XStack>
                            </Card>
                          ) : (
                            <FlatList
                              data={ticketItemsFeedback}
                              horizontal
                              keyExtractor={item =>
                                'OrganizationDetailFeedbackCard' + item.id
                              }
                              showsHorizontalScrollIndicator={false}
                              contentContainerStyle={{
                                gap: 10,
                              }}
                              renderItem={({item}) => (
                                <Stack
                                  width={(width / 3) * 2 - 20}
                                  key={
                                    'OrganizationDetailFeedbackCardInner' +
                                    item.id
                                  }>
                                  <Card
                                    backgroundColor={'white'}
                                    borderRadius={'$3'}
                                    paddingHorizontal={4}
                                    elevation={0}
                                    elevate={false}
                                    flex={1}
                                    justifyContent="center">
                                    <YStack
                                      padding={12}
                                      gap={8}
                                      flex={1}
                                      justifyContent="space-between">
                                      <YStack>
                                        <XStack
                                          alignItems="center"
                                          gap={8}
                                          marginBottom={8}>
                                          <Avatar circular size="$4">
                                            <Avatar.Image
                                              source={{
                                                uri:
                                                  getUserAvatar(
                                                    item.order.user,
                                                  ) ??
                                                  require('../../assets/placeholder.png'),
                                              }}
                                            />
                                            <Avatar.Fallback>
                                              <Stack
                                                alignItems="center"
                                                justifyContent="center"
                                                flex={1}
                                                width={'100%'}
                                                height={'100%'}
                                                backgroundColor={'lightgray'}>
                                                <Text>
                                                  {item.order.user.first_name
                                                    ?.charAt(0)
                                                    .toUpperCase() ||
                                                    item.order.user.last_name
                                                      ?.charAt(0)
                                                      .toUpperCase() ||
                                                    '?'}
                                                </Text>
                                              </Stack>
                                            </Avatar.Fallback>
                                          </Avatar>
                                          <YStack>
                                            <Text
                                              fontSize={'$4'}
                                              fontWeight="600">
                                              {item.order.user.first_name}{' '}
                                              {item.order.user.last_name}
                                            </Text>
                                            <Text fontSize={'$3'} color="#666">
                                              {dayjs(
                                                item.feedback_at,
                                              ).fromNow()}
                                            </Text>
                                          </YStack>
                                        </XStack>
                                        <Stack
                                          paddingHorizontal={2}
                                          paddingVertical={4}
                                          alignItems="center"
                                          justifyContent="center"
                                          borderWidth={1}
                                          marginVertical={2}
                                          flexDirection="row"
                                          borderColor="#736f6fff"
                                          borderRadius={4}>
                                          <Text
                                            fontSize={'$2'}
                                            color="#4b4a4aff"
                                            textAlign="center">
                                            {item.ticket.event_show.event.title}{' '}
                                            - {item.ticket.event_show.title}
                                          </Text>
                                        </Stack>
                                        <Paragraph
                                          fontSize={'$4'}
                                          marginTop={4}
                                          lineHeight={18}>
                                          {item.feedback}
                                        </Paragraph>
                                      </YStack>
                                    </YStack>
                                  </Card>
                                </Stack>
                              )}
                            />
                          )}
                        </>
                      )}
                    </YStack>
                  </YStack>
                </ScrollView>
              </YStack>
            </>
          ) : (
            <YStack
              flex={1}
              justifyContent="center"
              alignItems="center"
              padding={16}>
              <Text fontSize={'$5'}>Không tìm thấy ban tổ chức</Text>
              <Button
                onPress={() => navigation.goBack()}
                marginTop={16}
                borderRadius={0}
                theme={'accent'}>
                Quay lại
              </Button>
            </YStack>
          )}
        </>
      )}
    </>
  );
}
