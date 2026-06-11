import {useEffect} from 'react';
import axios from 'axios';
import useAppStore from '../store/app.store';
import {getUniqueId} from 'react-native-device-info';
import useAuthStore from '../store/auth.store';
import {useToastController} from '@tamagui/toast';
import useRefreshToken from './useRefreshToken';
import {BACKEND_URL, SOCKET_URL} from '../config/env';

export {BACKEND_URL, SOCKET_URL};

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

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token?: string) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const useAxios = () => {
  const toast = useToastController();
  const resetAuthStore = useAuthStore(state => state.reset);
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
    resetAuthStore();
  };

  useEffect(() => {
    const requestIntercept = axiosIns.interceptors.request.use(
      async config => {
        if (!config.headers.Authorization) {
          const token = accessToken;
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (!config.headers['x-device-id']) {
          if (!deviceId) {
            const uniqueId = await getUniqueId();
            setDeviceId(uniqueId);
            config.headers['x-device-id'] = uniqueId;
          } else {
            config.headers['x-device-id'] = deviceId;
          }
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
        const originalRequest = error?.config;
        if (error?.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            // Nếu đang refresh, đẩy request này vào hàng đợi (Queue)
            return new Promise((resolve, reject) => {
              failedQueue.push({resolve, reject});
            })
              .then((token: unknown) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axiosIns(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          return new Promise((resolve, reject) => {
            refreshToken()
              .then(newToken => {
                if (!newToken) {
                  processQueue(new Error('Refresh failed'));
                  reject(error);
                  handleError();
                  return;
                }

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                processQueue(null, newToken);
                resolve(axiosIns(originalRequest));
              })
              .catch(err => {
                processQueue(err);
                reject(err);
                handleError();
              })
              .finally(() => {
                isRefreshing = false;
              });
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
