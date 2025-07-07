import {useToastController} from '@tamagui/toast';
import {getMessage} from '../utils';

const useToast = () => {
  const toast = useToastController();
  const toastOnError = (error: any) => {
    if (error.response?.data?.message) {
      if (typeof error.response.data.message === 'string') {
        toast?.show('Có lỗi xảy ra!', {
          message:
            getMessage(error.response.data.message) ??
            error.response.data.message,
          native: false,
          customData: {
            theme: 'red',
          },
        });
      } else {
        const messages: string[] = Object.values(error.response.data.message);
        messages.forEach((message: string) => {
          toast?.show('Có lỗi xảy ra!', {
            message,
            native: false,
            customData: {
              theme: 'red',
            },
          });
        });
      }
    } else {
      toast?.show('Có lỗi xảy ra!', {
        message: error.message || 'Lỗi không xác định',
        native: false,
        customData: {
          theme: 'red',
        },
      });
    }
  };
  return {toast, toastOnError};
};

export default useToast;
