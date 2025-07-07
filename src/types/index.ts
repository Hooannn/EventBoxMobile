import type {AxiosResponse} from 'axios';
export interface IProvince {
  code: number;
  codename: string;
  districts: IDistrict[];
  division_type: string;
  name: string;
  phone_code: number;
}

export interface IDistrict {
  code: number;
  codename: string;
  division_type: string;
  name: string;
  province_code: number;
  wards: IWard[];
}

export interface IWard {
  code: number;
  codename: string;
  district_code: number;
  division_type: string;
  name: string;
}

export interface IResponseData<T> {
  data: T;
  code: number;
  message: string;
  took?: number;
  total?: number;
}

export interface Response<T> extends AxiosResponse {
  data: IResponseData<T>;
}

export interface IPermission {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
}

export interface IRole {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  permissions: IPermission[];
}

export interface IUser {
  id: number;
  created_at: string;
  updated_at: string;
  activated_at: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  birthday: string | null;
  roles: IRole[];
  assets: IAsset[];
}

export type IAssetUsage =
  | 'AVATAR'
  | 'EVENT_LOGO'
  | 'EVENT_BANNER'
  | 'TICKET_LOGO'
  | 'EVENT_FEATURED_IMAGE';

export interface IAsset {
  id: string;
  created_at: string;
  updated_at: string;
  signature: string;
  public_id: string;
  original_url: string;
  secure_url: string;
  usage: IAssetUsage;
  format: string;
  resource_type: string;
  width: number;
  height: number;
  bytes: number;
  folder: string;
  etag: string;
}

export interface IOrganization {
  id: number;
  created_at: string;
  updated_at: string;
  user_organizations: IUserOrganization[];
  name: string;
  phone?: string | null;
  website?: string | null;
  email?: string | null;
  description: string;
  assets: IAsset[];
  paypal_account: string;
}

export type IOrganizationRole = 'OWNER' | 'MANAGER' | 'STAFF';
export interface IUserOrganization {
  id: {
    user_id: number;
    organization_id: number;
  };
  user: IUser;
  created_at: string;
  updated_at: string;
  role: IOrganizationRole;
}

export interface ICategory {
  id: number;
  created_at: string;
  updated_at: string;
  slug: string;
  name_en: string;
  name_vi: string;
}

export type IEventStatus = 'DRAFT' | 'ARCHIVED' | 'PUBLISHED' | 'PENDING';

export interface IEvent {
  id: number;
  organization: IOrganization;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  address: string;
  place_name: string;
  categories: ICategory[];
  keywords: IKeyword[];
  assets: IAsset[];
  shows: IEventShow[];
  status: IEventStatus;
  published_at?: string | null;
  payout_at?: string | null;
}

export interface IKeyword {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
}

export interface IEventShow {
  id: number;
  created_at: string;
  updated_at: string;
  event_id: number;
  start_time: string;
  sale_start_time: string;
  sale_end_time: string;
  end_time: string;
  tickets: ITicket[];
}

export interface ITicket {
  id: number;
  created_at: string;
  updated_at: string;
  event_show_id: number;
  name: string;
  description?: string | null;
  price: number;
  assets: IAsset[];
  available: boolean;
  initial_stock: number;
  stock: number;
}

export type IOrderStatus = 'PENDING' | 'CANCELED' | 'PROCESSING' | 'FULFILLED';
export interface IOrder {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  user: IUser;
  items: ITicketItem[];
  status: IOrderStatus;
  payments: IPayment[];
  place_total: number;
}

export interface ITicketItem {
  created_at: string;
  updated_at: string;
  order_id: number;
  ticket_id: number;
  ticket: ITicket;
  quantity: number;
  place_total: number;
  traces: ITicketItemTrace[];
}

export type ITicketItemTraceEvent = 'CHECKED_IN' | 'WENT_OUT';

export interface ITicketItemTrace {
  created_at: string;
  ticket_item_order_id: number;
  ticket_item_ticket_id: number;
  id: number;
  event: ITicketItemTraceEvent;
  description?: string | null;
  issuer: IUser;
  issuer_id: string;
}

export interface IPayment {
  id: number;
  created_at: string;
  updated_at: string;
  order_id: number;
  paypal_order_id: string;
  payer_email: string;
  payer_given_name: string;
  payer_surname: string;
  payer_id: string;
  paypal_capture_id?: string | null;
  captured_at?: string | null;
  is_fulfilled: boolean;
  exchange_rate_source_currency?: string | null;
  exchange_rate_target_currency?: string | null;
  exchange_rate_value?: number | null;
  paypal_fee_value?: number | null;
  paypal_fee_currency?: string | null;
  gross_amount_value?: number | null;
  gross_amount_currency?: string | null;
  net_amount_value?: number | null;
  net_amount_currency?: string | null;
  receivable_amount?: number | null;
  receivable_amount_currency?: string | null;
}
