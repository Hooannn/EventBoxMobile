import {useEffect} from 'react';
import axios from 'axios';
import useAppStore from '../store/app.store';
import {getUniqueId} from 'react-native-device-info';

const BACKEND_URL = 'https://api.example.com'; // Replace with your backend URL

export const axiosIns = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
});

const useAxios = () => {
  const deviceId = useAppStore(state => state.deviceId);
  const setDeviceId = useAppStore(state => state.setDeviceId);
  const handleError = () => {};

  const refreshToken = async () => {
    return '';
  };

  useEffect(() => {
    const requestIntercept = axiosIns.interceptors.request.use(
      async config => {
        if (!config.headers['Authorization']) {
          const token = 'your_token_here';
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
        if (
          error?.response?.status === 401 &&
          error?.response?.data?.message === 'expired_token' &&
          !prevRequest?.sent
        ) {
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
  }, [deviceId, setDeviceId]);

  return axiosIns;
};

export default useAxios;
