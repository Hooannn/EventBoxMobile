import React, {useCallback, useState} from 'react';
import {
  Text,
  Spinner,
  Stack,
  YStack,
  ScrollView,
  Paragraph,
  Card,
  XStack,
  Image,
} from 'tamagui';
import AppBar from '../../components/AppBar';
import useAxios from '../../hooks/useAxios';
import {useQuery} from '@tanstack/react-query';
import {IOrganization, IResponseData} from '../../types';
import {RefreshControl} from 'react-native';
import {Box} from '@tamagui/lucide-icons';
import {getOrganizationLogo} from '../../utils';
import {SCREENS} from '../../navigation';
import {useNavigation} from '@react-navigation/native';

export default function HomeScreen() {
  const axios = useAxios();

  const getMyOrganizationsQuery = useQuery({
    queryKey: ['fetch/organizations/me/member'],
    queryFn: () =>
      axios.get<IResponseData<IOrganization[]>>('/v1/organizations/me/member'),
    refetchOnWindowFocus: false,
  });

  const organizations = getMyOrganizationsQuery.data?.data?.data || [];

  const isLoading = getMyOrganizationsQuery.isLoading;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      Promise.all([getMyOrganizationsQuery.refetch()]);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [getMyOrganizationsQuery]);

  const navigation = useNavigation();

  return (
    <YStack flex={1} justifyContent="center" alignItems="center">
      <AppBar>
        <Stack
          paddingTop={8}
          paddingBottom={8}
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          flex={1}>
          <Text color={'white'} fontWeight={700} fontSize={'$7'}>
            Tổ chức của bạn
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
          {organizations.length > 0 ? (
            <ScrollView
              flexGrow={1}
              width={'100%'}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }>
              <YStack
                gap={8}
                flex={1}
                width={'100%'}
                paddingBottom={20}
                padding={'$3'}>
                {organizations.map(organization => (
                  <Card
                    borderRadius={0}
                    onPress={() => {
                      navigation.navigate(SCREENS.ORGANIZATION, organization);
                    }}
                    key={'Organization' + organization.id}
                    padding={12}
                    bordered
                    animation="bouncy"
                    pressStyle={{
                      scale: 0.99,
                    }}
                    backgroundColor="white">
                    <XStack alignItems="center" gap={12}>
                      <Image
                        source={{
                          uri:
                            getOrganizationLogo(organization) ||
                            'https://via.placeholder.com/150',
                        }}
                        width={75}
                        height={75}
                        borderRadius={75}
                      />

                      <YStack flex={1}>
                        <Text fontSize={'$5'} fontWeight="bold">
                          {organization.name}
                        </Text>
                        <Paragraph fontSize={'$3'} lineHeight={20}>
                          {organization.description}
                        </Paragraph>
                      </YStack>
                    </XStack>
                  </Card>
                ))}
              </YStack>
            </ScrollView>
          ) : (
            <YStack
              flex={1}
              width={'100%'}
              alignItems="center"
              justifyContent="center"
              gap={4}
              padding={16}>
              <Box size={80} color="lightgray" />
              <Text fontSize={'$3'} color={'gray'}>
                Bạn chưa tham gia tổ chức nào
              </Text>
            </YStack>
          )}
        </>
      )}
    </YStack>
  );
}
