import {IEvent, IEventShow, IOrderStatus, IOrganization, IUser} from '../types';
import dayjs from '../libs/dayjs';
import dictionary from './translation.json';

const getUserAvatar = (user?: IUser) => {
  if (!user) {
    return undefined;
  }
  if (user.assets && user.assets.length > 0) {
    const avatar = user.assets.find(asset => asset.usage === 'AVATAR');
    if (avatar) {
      return avatar.secure_url;
    }
  }
  return undefined;
};

const getOrganizationLogo = (org?: IOrganization) => {
  if (!org) {
    return undefined;
  }
  if (org.assets && org.assets.length > 0) {
    const logo = org.assets.find(asset => asset.usage === 'AVATAR');
    if (logo) {
      return logo.secure_url;
    }
  }
  return undefined;
};

const organizationRoleColors: Record<
  string,
  | 'success'
  | 'default'
  | 'primary'
  | 'secondary'
  | 'warning'
  | 'danger'
  | undefined
> = {
  OWNER: 'warning',
  MANAGER: 'success',
  STAFF: 'secondary',
};

const orderStatusTexts: Record<IOrderStatus, string> = {
  FULFILLED: 'Đã thanh toán',
  PENDING: 'Chờ thanh toán',
  WAITING_FOR_PAYMENT: 'Chờ thanh toán',
  APPROVED: 'Đang xử lý',
};

const isOwner = (user: IUser, organization: IOrganization) => {
  return (
    organization.user_organizations?.find(
      uo => uo.id.user_id === user.id && uo.role === 'OWNER',
    ) !== undefined
  );
};

const priceFormat = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

export const priceFormatV2 = (price: number, currency = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
  }).format(price);
};

const stringToDateFormat = (date: string) =>
  dayjs(date).format('DD/MM/YYYY, HH:mm');

const stringToDateFormatV2 = (date: string) =>
  dayjs(date).format('HH:mm, D MMMM, YYYY');

const getEventLogo = (event: IEvent) => {
  if (event.assets && event.assets.length > 0) {
    const logo = event.assets.find(asset => asset.usage === 'EVENT_LOGO');
    if (logo) {
      return logo.secure_url;
    }
  }
  return undefined;
};

const getEventBackground = (event: IEvent) => {
  if (event.assets && event.assets.length > 0) {
    const logo = event.assets.find(asset => asset.usage === 'EVENT_BANNER');
    if (logo) {
      return logo.secure_url;
    }
  }
  return undefined;
};

const getFirstShowStartTime = (event: IEvent) => {
  if (event.shows && event.shows.length > 0) {
    const latestShow = event.shows.reduce((prev, current) => {
      return dayjs(prev.start_time).isBefore(dayjs(current.start_time))
        ? prev
        : current;
    });
    return dayjs(latestShow.start_time).format('DD/MM/YYYY, HH:mm');
  }
  return undefined;
};

const getFirstShowStartTimeV2 = (event: IEvent) => {
  if (event.shows && event.shows.length > 0) {
    const latestShow = event.shows.reduce((prev, current) => {
      return dayjs(prev.start_time).isBefore(dayjs(current.start_time))
        ? prev
        : current;
    });
    return dayjs(latestShow.start_time).format('D MMMM, YYYY');
  }
  return undefined;
};

const getMinimumShowTicketPrice = (event: IEvent) => {
  if (event.shows && event.shows.length > 0) {
    const prices = event.shows.map(show =>
      show.tickets.reduce((min, ticket) => {
        return Math.min(min, ticket.price);
      }, Infinity),
    );
    return Math.min(...prices);
  }
  return undefined;
};

const getMessage = (code: string) => {
  const message = (dictionary as any)[code];
  if (message) {
    return message;
  }
  return null;
};

const isSubsribed = (org?: IOrganization, user?: IUser) => {
  if (!org || !user) {
    return false;
  }
  return user.subscriptions?.some(subscription => subscription.id === org.id);
};

const formatHoursAndMinutes = (diff: number) => {
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const format = (n: number) => String(n).padStart(2, '0');
  return `${format(minutes)}:${format(seconds)}`;
};

const isEventShowAvailable = (eventShow: IEventShow) => {
  const now = dayjs();
  const saleStartTime = dayjs(eventShow.sale_start_time);
  const saleEndTime = dayjs(eventShow.sale_end_time);

  if (now.isBefore(saleStartTime)) {
    return {
      available: false,
      reason: 'Mở bán từ ' + saleStartTime.format('DD/MM/YYYY, HH:mm'),
    };
  } else if (now.isAfter(saleEndTime)) {
    return {
      available: false,
      reason: 'Đã hết thời gian bán vé',
    };
  }
  return {
    available: true,
    reason: null,
  };
};

export {
  orderStatusTexts,
  isEventShowAvailable,
  formatHoursAndMinutes,
  isSubsribed,
  getUserAvatar,
  getOrganizationLogo,
  organizationRoleColors,
  isOwner,
  stringToDateFormat,
  priceFormat,
  getEventLogo,
  getEventBackground,
  getMessage,
  getFirstShowStartTime,
  getFirstShowStartTimeV2,
  getMinimumShowTicketPrice,
  stringToDateFormatV2,
};
