import {useEffect} from 'react';
import axios from 'axios';
import useAppStore from '../store/app.store';
import {getUniqueId} from 'react-native-device-info';
import useAuthStore from '../store/auth.store';
import {useToastController} from '@tamagui/toast';
import useRefreshToken from './useRefreshToken';

export const BACKEND_URL = 'https://eventboxserver.eclass.ink/api';
export const SOCKET_URL = 'wss://eventboxsocket.eclass.ink';

export const axiosIns = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
});

export const rawAxios = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
});

const useAxios = () => {
  const toast = useToastController();
  const reset = useAuthStore(state => state.reset);
  const deviceId = useAppStore(state => state.deviceId);
  const setDeviceId = useAppStore(state => state.setDeviceId);
  const accessToken = useAuthStore(state => state.accessToken);
  const refreshToken = useRefreshToken();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleError = () => {
    toast?.show('Phiên đăng nhập hết hạn', {
      message: 'Vui lòng đăng nhập lại để tiếp tục sử dụng ưng dụng',
      native: false,
      customData: {
        theme: 'yellow',
      },
    });
    reset();
  };

  useEffect(() => {
    const requestIntercept = axiosIns.interceptors.request.use(
      async config => {
        if (!config.headers['Authorization']) {
          const token = accessToken;
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        if (!config.headers['x-device-id']) {
          if (!deviceId) {
            const uniqueId = await getUniqueId();
            setDeviceId(uniqueId);
          }
          config.headers['x-device-id'] = deviceId;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    const responseIntercept = axiosIns.interceptors.response.use(
      response => response,
      async error => {
        const prevRequest = error?.config;
        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;
          let token: string | null = null;
          try {
            token = await refreshToken();
          } catch (error) {
            handleError();
            return Promise.reject(error);
          }
          prevRequest.headers.Authorization = `Bearer ${token}`;
          return axiosIns({
            ...prevRequest,
            headers: prevRequest.headers.toJSON(),
          });
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axiosIns.interceptors.request.eject(requestIntercept);
      axiosIns.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken, deviceId, handleError, refreshToken, setDeviceId]);

  return axiosIns;
};

export default useAxios;
