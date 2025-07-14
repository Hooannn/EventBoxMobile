import {useNavigation, useRoute} from '@react-navigation/native';
import {
  Text,
  ScrollView,
  YStack,
  Button,
  XStack,
  Card,
  Image,
  Separator,
  Stack,
  Avatar,
  Accordion,
  Paragraph,
  Square,
} from 'tamagui';
import {IEvent, IResponseData, IUser} from '../../types';
import {LayoutChangeEvent, RefreshControl} from 'react-native';
import AppBar from '../../components/AppBar';
import {
  ArrowUpRightFromSquare,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Plus,
  ChevronUp,
  MapPin,
  Group,
  ChevronRight,
} from '@tamagui/lucide-icons';
import {useCallback, useEffect, useRef, useState} from 'react';
import {Share} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  getEventBackground,
  getEventLogo,
  getFirstShowStartTimeV2,
  getMessage,
  getMinimumShowTicketPrice,
  getOrganizationLogo,
  isSubsribed,
  priceFormat,
  stringToDateFormatV2,
} from '../../utils';
import HTMLView from 'react-native-htmlview';
import React from 'react';
import ImageViewProvider from '../../components/ImageViewProvider';
import useToast from '../../hooks/useToast';
import useAuthStore from '../../store/auth.store';
import useAxios from '../../hooks/useAxios';
import {useMutation, useQuery} from '@tanstack/react-query';
import LoadingOverlay from '../../components/LoadingOverlay';

export default function EventDetailScreen() {
  const route = useRoute();
  const {id: eventId} = route.params as IEvent;
  const navigation = useNavigation();
  const {toast, toastOnError} = useToast();
  const insets = useSafeAreaInsets();
  const axios = useAxios();
  const authUser = useAuthStore(state => state.user);
  const setAuthUser = useAuthStore(state => state.setUser);

  const getEventQuery = useQuery({
    queryKey: ['fetch/event/id', eventId],
    queryFn: () => axios.get<IResponseData<IEvent>>(`/v1/events/${eventId}`),
    refetchOnWindowFocus: false,
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getEventQuery.refetch().finally(() => {
      setRefreshing(false);
    });
  }, [getEventQuery]);

  const [aspectRatio, setAspectRatio] = useState(0);

  const event = getEventQuery.data?.data?.data;

  useEffect(() => {
    if (!event) {
      return;
    }
    Image.getSize(getEventBackground(event)!, (width, height) =>
      setAspectRatio(width / height),
    );
  }, [event]);

  const onBookingPress = (eventShowId: number) => {
    navigation.navigate('CheckOut', {
      event: event,
      eventShowId,
    });
  };

  const selectShowPress = () => {
    scrollToElement();
  };

  const getPrimaryAction = () => {
    if (!event) {
      return null;
    }
    if (event.shows?.length > 1) {
      return (
        <Button
          theme={'accent'}
          borderRadius={0}
          flex={1}
          height={52}
          onPress={selectShowPress}
          paddingHorizontal={24}>
          Chọn lịch diễn
        </Button>
      );
    }
    return (
      <Button
        theme={'accent'}
        borderRadius={0}
        onPress={() => onBookingPress(event.shows[0].id)}
        flex={1}
        height={52}
        paddingHorizontal={24}>
        Mua vé ngay
      </Button>
    );
  };

  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (!contentHeight) {
      setContentHeight(height);
    }
  };

  const shouldCollapse = () => contentHeight && contentHeight > 300;

  const scrollRef = useRef(null);
  const showsRef = useRef(null);

  const scrollToElement = () => {
    showsRef.current?.measureLayout(scrollRef.current, (x, y) => {
      scrollRef.current?.scrollTo({y, animated: true});
    });
  };

  const subsribed = () => isSubsribed(event?.organization, authUser);

  const subscribeMutation = useMutation({
    mutationFn: () =>
      axios.post<IResponseData<boolean>>(
        `/v1/organizations/${event?.organization.id}/subscribe`,
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

  return (
    <>
      {getEventQuery.isLoading ? (
        <LoadingOverlay />
      ) : (
        <>
          {event ? (
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
                      Chi tiết sự kiện
                    </Text>
                  </XStack>
                  <Button
                    backgroundColor={'transparent'}
                    variant="outlined"
                    themeInverse
                    onPress={() => {
                      Share.share({
                        message: `Check out this event: ${event.title}`,
                      });
                    }}
                    circular
                    icon={<ArrowUpRightFromSquare size={20} />}></Button>
                </AppBar>

                <ScrollView
                  flexGrow={1}
                  ref={scrollRef}
                  width={'100%'}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }>
                  <YStack flex={1} width={'100%'}>
                    <Card elevate={false} width={'100%'}>
                      <Card.Header>
                        <YStack>
                          <ImageViewProvider uri={getEventLogo(event) ?? ''}>
                            <Image
                              borderRadius={12}
                              alignSelf="center"
                              source={{
                                width: '100%',
                                height: 200,
                                uri: getEventLogo(event),
                              }}
                            />
                          </ImageViewProvider>
                          <YStack
                            gap={6}
                            borderRadius={12}
                            backgroundColor={'#38383d'}
                            padding={16}>
                            <Text
                              fontWeight={700}
                              fontSize={'$6'}
                              color={'whitesmoke'}>
                              {event.title}
                            </Text>
                            <XStack gap={8} alignItems="center">
                              <Calendar color={'whitesmoke'} size={16} />
                              <XStack alignItems="center" gap={4}>
                                <Text color={'whitesmoke'}>Bắt đầu từ</Text>
                                <Text color={'whitesmoke'} fontWeight={800}>
                                  {getFirstShowStartTimeV2(event)}
                                </Text>
                              </XStack>
                            </XStack>
                            <XStack gap={8}>
                              <MapPin color={'whitesmoke'} size={16} />
                              <YStack>
                                <Text fontWeight={800} color={'whitesmoke'}>
                                  {event.place_name}
                                </Text>
                                <Text color={'whitesmoke'} fontSize={'$3'}>
                                  {event.address}
                                </Text>
                              </YStack>
                            </XStack>
                          </YStack>
                        </YStack>
                      </Card.Header>

                      <Card.Background>
                        <Image
                          resizeMode="cover"
                          alignSelf="center"
                          blurRadius={2}
                          source={{
                            width: 2000,
                            height: 1000,
                            uri: getEventLogo(event),
                          }}
                        />
                      </Card.Background>
                    </Card>
                  </YStack>

                  <YStack width={'100%'} padding={16} gap={12}>
                    <YStack padding={16} gap={12} backgroundColor={'white'}>
                      <Text fontSize={'$6'} fontWeight={'700'}>
                        Giới thiệu
                      </Text>
                      <Separator />
                      <Stack
                        paddingBottom={40}
                        maxHeight={
                          shouldCollapse() && isCollapsed ? 300 : 'unset'
                        }
                        overflow="hidden"
                        position="relative"
                        onLayout={handleLayout}>
                        <HTMLView value={event.description} />
                      </Stack>
                      {shouldCollapse() && (
                        <Button
                          position="absolute"
                          iconAfter={
                            isCollapsed ? <ChevronDown /> : <ChevronUp />
                          }
                          bottom={0}
                          zIndex={1}
                          size="$3"
                          height={40}
                          borderRadius={0}
                          left={0}
                          right={0}
                          backgroundColor="white"
                          onPress={() => setIsCollapsed(!isCollapsed)}>
                          {isCollapsed ? 'Xem thêm' : 'Thu gọn'}
                        </Button>
                      )}
                    </YStack>

                    <ImageViewProvider uri={getEventBackground(event) ?? ''}>
                      <Image
                        width={'100%'}
                        aspectRatio={aspectRatio}
                        objectFit="contain"
                        source={{
                          uri: getEventBackground(event),
                        }}
                      />
                    </ImageViewProvider>

                    <YStack
                      ref={showsRef}
                      padding={16}
                      gap={12}
                      backgroundColor={'#38383d'}>
                      <Text
                        fontSize={'$6'}
                        fontWeight={'700'}
                        color={'whitesmoke'}>
                        Thông tin vé
                      </Text>
                      <Separator />
                      <Accordion
                        themeInverse
                        overflow="hidden"
                        width="100%"
                        type="single">
                        {event.shows?.map((show, index) => (
                          <Accordion.Item key={index} value={`show-${index}`}>
                            <Accordion.Trigger
                              flexDirection="row"
                              width={'100%'}
                              borderWidth={0}
                              alignItems="center"
                              backgroundColor={'transparent'}
                              justifyContent="space-between">
                              {({open}: {open: boolean}) => (
                                <>
                                  <XStack
                                    maxWidth={'50%'}
                                    flex={1}
                                    alignItems="center"
                                    gap={8}>
                                    <Square
                                      animation="quick"
                                      rotate={open ? '90deg' : '0deg'}>
                                      <ChevronRight
                                        size="$1"
                                        color={'whitesmoke'}
                                      />
                                    </Square>
                                    <Text
                                      ellipsizeMode="tail"
                                      fontWeight={800}
                                      color={'whitesmoke'}
                                      fontSize={'$4'}>
                                      {stringToDateFormatV2(show.start_time)} -{' '}
                                      {stringToDateFormatV2(show.end_time)}
                                    </Text>
                                  </XStack>
                                  <Button
                                    onPress={() => onBookingPress(show.id)}
                                    maxWidth={'50%'}
                                    borderRadius={0}>
                                    Mua vé ngay
                                  </Button>
                                </>
                              )}
                            </Accordion.Trigger>
                            <Accordion.HeightAnimator animation="medium">
                              <Accordion.Content
                                backgroundColor={'transparent'}
                                flexDirection="column"
                                gap={12}
                                exitStyle={{opacity: 0}}>
                                {show.tickets.map((ticket, ticketIndex) => (
                                  <YStack key={ticketIndex + ticket.name}>
                                    <XStack
                                      justifyContent="space-between"
                                      alignItems="center">
                                      <Text
                                        color={'whitesmoke'}
                                        fontWeight={800}>
                                        {ticket.name}
                                      </Text>
                                      <YStack alignItems="flex-end">
                                        <Text
                                          color={'green'}
                                          fontWeight={800}
                                          fontSize={'$5'}>
                                          {priceFormat(ticket.price)}
                                        </Text>
                                        {ticket.stock > 0 ? (
                                          <Text
                                            color={'darkorange'}
                                            fontSize={'$3'}>
                                            {ticket.stock}/
                                            {ticket.initial_stock} vé
                                          </Text>
                                        ) : (
                                          <Text color={'red'} fontSize={'$3'}>
                                            Hết vé
                                          </Text>
                                        )}
                                      </YStack>
                                    </XStack>
                                    <Paragraph color={'whitesmoke'}>
                                      {ticket.description}
                                    </Paragraph>
                                  </YStack>
                                ))}
                              </Accordion.Content>
                            </Accordion.HeightAnimator>
                          </Accordion.Item>
                        ))}
                      </Accordion>
                    </YStack>

                    <YStack padding={16} gap={12} backgroundColor={'white'}>
                      <Text fontSize={'$6'} fontWeight={'700'}>
                        Ban tổ chức
                      </Text>
                      <Separator />
                      <YStack>
                        <XStack
                          alignItems="center"
                          justifyContent="space-between">
                          <Avatar circular size="$7">
                            <Avatar.Image
                              src={getOrganizationLogo(event.organization)}
                            />
                            <Avatar.Fallback
                              backgroundColor={'gray'}
                              alignItems="center"
                              justifyContent="center">
                              <Group size={40} color={'white'} />
                            </Avatar.Fallback>
                          </Avatar>
                          <Button
                            onPress={handleSubscribe}
                            borderRadius={0}
                            themeInverse={subsribed()}
                            theme={subsribed() ? 'red' : 'green'}
                            icon={subsribed() ? undefined : <Plus />}>
                            {subsribed() ? 'Bỏ theo dõi' : 'Theo dõi'}
                          </Button>
                        </XStack>
                        <Text fontWeight={700} fontSize={'$5'} marginTop={8}>
                          {event.organization.name}
                        </Text>
                        <Paragraph fontSize={'$3'} color={'gray'}>
                          {event.organization.description}
                        </Paragraph>
                      </YStack>
                    </YStack>
                  </YStack>
                </ScrollView>
                <XStack
                  paddingBottom={insets.bottom + 12}
                  boxShadow={'$lg'}
                  backgroundColor={'white'}
                  paddingHorizontal={16}
                  paddingTop={12}
                  width="100%"
                  justifyContent="space-between">
                  <XStack gap={4} alignItems="center" flex={1}>
                    <Text fontSize={'$6'}>Từ</Text>
                    <Text fontWeight={700} fontSize={'$8'}>
                      {priceFormat(getMinimumShowTicketPrice(event) || 0)}
                    </Text>
                  </XStack>
                  {getPrimaryAction()}
                </XStack>
              </YStack>
            </>
          ) : (
            <YStack
              flex={1}
              justifyContent="center"
              alignItems="center"
              padding={16}>
              <Text fontSize={'$5'}>Không tìm thấy sự kiện</Text>
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
