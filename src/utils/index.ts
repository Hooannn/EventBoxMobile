import {IEvent, IOrganization, IUser} from '../types';
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

export {
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
