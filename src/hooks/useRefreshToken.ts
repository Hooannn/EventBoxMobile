import useAuthStore from '../store/auth.store';
import {axiosIns} from './useAxios';

const useRefreshToken = () => {
  const {
    refreshToken: storedRefreshToken,
    setRefreshToken,
    setAccessToken,
  } = useAuthStore();

  const refresh = async () =>
    new Promise<string | null>((resolve, reject) => {
      axiosIns({
        url: '/v1/auth/refresh',
        method: 'POST',
        validateStatus: null,
        data: {
          refresh_token: storedRefreshToken,
        },
      })
        .then(res => {
          if (res?.status !== 200) {
            reject(null);
          }
          const {access_token: accessToken, refresh_token: refreshToken} =
            res?.data?.data;
          if (accessToken && refreshToken) {
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
            resolve(accessToken);
          } else {
            reject(null);
          }
        })
        .catch(() => {
          reject(null);
        });
    });

  return refresh;
};

export default useRefreshToken;
