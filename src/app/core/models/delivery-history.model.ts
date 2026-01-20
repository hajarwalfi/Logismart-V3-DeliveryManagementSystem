/**
 * Delivery History Models - matches backend DTOs
 */

export interface DeliveryHistoryResponse {
  id: string;
  parcelId: string;
  status: ParcelStatus;
  timestamp: string; // ISO 8601 date string
  comment?: string;
  location?: string;
  deliveryPersonName?: string;
}

export interface DeliveryHistoryCreate {
  parcelId: string;
  status: ParcelStatus;
  comment?: string;
  location?: string;
}

/**
 * Parcel Status Enum
 */
export enum ParcelStatus {
  CREATED = 'CREATED',
  COLLECTED = 'COLLECTED',
  IN_STOCK = 'IN_STOCK',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED'
}

/**
 * Parcel Priority Enum
 */
export enum ParcelPriority {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
  EXPRESS = 'EXPRESS'
}
