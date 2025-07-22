import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Button,
  YStack,
  Text,
  XStack,
  Input,
  Separator,
  Stack,
  Circle,
  Image,
  Spinner,
} from 'tamagui';
import AppBar from '../../components/AppBar';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ChevronLeft, Filter, Search, X} from '@tamagui/lucide-icons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useAxios from '../../hooks/useAxios';
import {useMutation, useQuery} from '@tanstack/react-query';
import {ICategory, IEvent, IResponseData} from '../../types';
import provinces from '../../utils/all-in-one.json';
import {FlatList} from 'react-native';
import EventCard from './EventCard';
import {SCREENS} from '../../navigation';

export default function SearchScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const params = route.params as {initCategoryId: number};

  const [internalSelectedCategories, setInternalSelectedCategories] = useState<
    number[]
  >([]);
  const [internalSelectedProvince, setInternalSelectedProvince] =
    useState<string>('');

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');

  const isFiltering =
    selectedCategories.length > 0 || selectedProvince.trim().length > 0;

  const axios = useAxios();

  const getCategoriesQuery = useQuery({
    queryKey: ['fetch/categories'],
    queryFn: () => axios.get<IResponseData<ICategory[]>>('/v1/categories'),
    refetchOnWindowFocus: false,
  });

  const categories = getCategoriesQuery.data?.data?.data || [];

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleDismissModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');

  const [events, setEvents] = useState<IEvent[]>([]);

  const triggerSearch = () => {
    const searchText = searchTerm.trim().toLowerCase();

    if (
      searchText.length === 0 &&
      selectedCategories.length === 0 &&
      selectedProvince.length === 0
    ) {
      setEvents([]);
      return;
    }

    searchMutation.mutate({
      query: searchText,
      province: selectedProvince,
      categories: selectedCategories,
    });
  };

  const onResetFilters = () => {
    const searchText = searchTerm.trim().toLowerCase();
    if (searchTerm.length === 0) {
      setEvents([]);
      return;
    }
    searchMutation.mutate({
      query: searchText,
      province: '',
      categories: [],
    });
  };

  const searchMutation = useMutation({
    mutationFn: (params: {
      query: string;
      province: string;
      categories: number[];
    }) =>
      axios.get<IResponseData<IEvent[]>>(
        `/v1/events/search?q=${params.query}&province=${
          params.province
        }&categories=${params.categories.join(',')}`,
      ),
    onSuccess: res => {
      setEvents(res.data.data || []);
    },
    onError: _ => {
      setEvents([]);
    },
  });

  const isLoading = searchMutation.isPending;

  useEffect(() => {
    if (selectedCategories.length > 0 || selectedProvince.length > 0) {
      triggerSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedProvince]);

  useEffect(() => {
    if (params?.initCategoryId) {
      setInternalSelectedCategories([params.initCategoryId]);
      setSelectedCategories([params.initCategoryId]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  const onEventCardPress = (event: IEvent) => {
    navigation.navigate(SCREENS.EVENT_DETAIL, {id: event.id});
  };
  return (
    <>
      <YStack style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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
              Tìm kiếm
            </Text>
          </XStack>
        </AppBar>

        <KeyboardAwareScrollView
          enableOnAndroid
          contentContainerStyle={{flexGrow: 1, width: '100%'}}>
          <YStack flex={1} width={'100%'} padding={16}>
            <XStack alignItems="center" width={'100%'} gap={8}>
              <XStack alignItems="center" flex={1}>
                <Button
                  size="$4"
                  icon={<Search />}
                  marginRight="$-4"
                  backgroundColor={'white'}
                  borderTopLeftRadius="$4"
                  borderBottomLeftRadius="$4"
                  borderTopRightRadius="$0"
                  borderBottomRightRadius="$0"
                  height={48}
                  onPress={triggerSearch}
                  borderWidth="$0"
                  borderRightWidth="$0"
                />
                <Input
                  placeholder="Tìm kiếm..."
                  backgroundColor={'white'}
                  height={48}
                  value={searchTerm}
                  returnKeyType="search"
                  onChangeText={setSearchTerm}
                  onSubmitEditing={triggerSearch}
                  flex={1}
                  borderWidth="$0"
                  borderBottomLeftRadius="$4"
                />
                <Button
                  size="$4"
                  icon={<X />}
                  display={searchTerm?.length ? 'flex' : 'none'}
                  onPress={() => {
                    setSearchTerm('');
                  }}
                  marginLeft="$-4"
                  height={48}
                  backgroundColor={'white'}
                  borderTopRightRadius="$4"
                  borderBottomRightRadius="$4"
                  borderTopLeftRadius="$0"
                  borderBottomLeftRadius="$0"
                  borderWidth="$0"
                  borderLeftWidth="$0"
                />
              </XStack>

              <Stack position="relative">
                {isFiltering && (
                  <Circle
                    position="absolute"
                    top={-4}
                    right={-4}
                    zIndex={1}
                    backgroundColor={'red'}
                    width={16}
                    height={16}
                    borderRadius={16}
                  />
                )}
                <Button
                  theme={'accent'}
                  size="$4"
                  onPress={handlePresentModalPress}
                  icon={<Filter />}
                  height={48}
                />
              </Stack>
            </XStack>

            <YStack
              flex={1}
              marginTop={16}
              gap={16}
              paddingBottom={insets.bottom + 16}>
              <XStack
                alignItems="center"
                justifyContent="space-between"
                width={'100%'}>
                <Text fontSize={'$5'} fontWeight={700}>
                  Kết quả tìm kiếm
                </Text>
              </XStack>

              <YStack flex={1} gap={16}>
                {isLoading ? (
                  <YStack flex={1} justifyContent="center" alignItems="center">
                    <Spinner />
                  </YStack>
                ) : (
                  <>
                    {events.length > 0 ? (
                      <FlatList
                        data={events}
                        numColumns={2}
                        keyExtractor={item => `SearchScreenEvent-${item.id}`}
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
                              key={'SearchScreenEventCardInner' + item.id}>
                              <EventCard
                                showOverview
                                event={item}
                                onPress={onEventCardPress}
                              />
                            </Stack>
                          );
                        }}
                      />
                    ) : (
                      <YStack
                        flex={1}
                        justifyContent="center"
                        alignItems="center">
                        <Image
                          source={{
                            width: 150,
                            height: 150,
                            uri: require('../../assets/undraw_search.png'),
                          }}
                        />
                        <Text fontSize={'$3'} color={'gray'}>
                          Không có kết quả nào phù hợp
                        </Text>
                      </YStack>
                    )}
                  </>
                )}
              </YStack>
            </YStack>
          </YStack>
        </KeyboardAwareScrollView>
      </YStack>

      <BottomSheetModalProvider>
        <BottomSheetModal ref={bottomSheetModalRef} maxDynamicContentSize={700}>
          <BottomSheetScrollView
            style={{
              flex: 1,
            }}>
            <YStack
              flex={1}
              width={'100%'}
              paddingHorizontal={24}
              paddingBottom={insets.bottom + 12}>
              <XStack alignItems="center" justifyContent="center">
                <Text fontSize={'$5'} fontWeight={700}>
                  Bộ lọc
                </Text>
              </XStack>

              <Separator marginTop={16} borderWidth={1} />

              <YStack marginTop={16} gap={4}>
                <Text fontSize={'$4'} fontWeight={600}>
                  Thể loại
                </Text>
                <Stack flexDirection="row" flexWrap="wrap" gap={8}>
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      size="$3"
                      theme={
                        internalSelectedCategories.includes(category.id)
                          ? 'accent'
                          : 'default'
                      }
                      onPress={() => {
                        if (internalSelectedCategories.includes(category.id)) {
                          setInternalSelectedCategories(prev =>
                            prev.filter(id => id !== category.id),
                          );
                        } else {
                          setInternalSelectedCategories(prev => [
                            ...prev,
                            category.id,
                          ]);
                        }
                      }}>
                      {category.name_vi}
                    </Button>
                  ))}
                </Stack>
              </YStack>

              <YStack marginTop={16} gap={4}>
                <Text fontSize={'$4'} fontWeight={600}>
                  Thành phố
                </Text>
                <Stack flexDirection="row" flexWrap="wrap" gap={8}>
                  {provinces.map((province, i) => (
                    <Button
                      key={'province' + i}
                      borderRadius={100}
                      size="$3"
                      theme={
                        internalSelectedProvince === province
                          ? 'accent'
                          : 'default'
                      }
                      onPress={() => {
                        if (internalSelectedProvince === province) {
                          setInternalSelectedProvince('');
                        } else {
                          setInternalSelectedProvince(province);
                        }
                      }}>
                      {province}
                    </Button>
                  ))}
                </Stack>
              </YStack>
            </YStack>
          </BottomSheetScrollView>
          <XStack
            alignItems="center"
            gap={8}
            paddingHorizontal={24}
            paddingTop={8}
            paddingBottom={insets.bottom + 8}>
            <Button
              borderRadius={0}
              theme={'accent'}
              width={'50%'}
              onPress={() => {
                setSelectedCategories(internalSelectedCategories);
                setSelectedProvince(internalSelectedProvince);
                handleDismissModalPress();

                if (
                  internalSelectedCategories.length == 0 &&
                  internalSelectedProvince.length == 0
                ) {
                  onResetFilters();
                }
              }}>
              Áp dụng
            </Button>
            <Button
              borderRadius={0}
              theme="alt"
              width={'50%'}
              onPress={() => {
                setInternalSelectedCategories([]);
                setInternalSelectedProvince('');
                setSelectedCategories([]);
                setSelectedProvince('');
                handleDismissModalPress();
                onResetFilters();
              }}>
              Đặt lại
            </Button>
          </XStack>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </>
  );
}
