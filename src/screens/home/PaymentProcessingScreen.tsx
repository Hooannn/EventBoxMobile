import React, {useEffect} from 'react';
import {YStack, Text} from 'tamagui';
import {SOCKET_URL} from '../../hooks/useAxios';
import useAuthStore from '../../store/auth.store';

export default function PaymentProcessingScreen() {
  const {user} = useAuthStore();

  useEffect(() => {
    const socket = new WebSocket(`${SOCKET_URL}/notification`, [], {
      headers: {
        'x-user-id': user?.id.toString() ?? '',
      },
    });

    socket.onopen = () => {
      console.log('WebSocket Connected');
    };

    socket.onmessage = event => {
      console.log('Message received:', event.data);
    };

    socket.onerror = error => {
      console.error('WebSocket Error:', error.message);
    };

    socket.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <YStack flex={1} justifyContent="center" alignItems="center">
      <Text>PaymentProcessingScreen</Text>
    </YStack>
  );
}
