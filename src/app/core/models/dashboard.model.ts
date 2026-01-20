/**
 * Extended Statistics Models for Manager Dashboard
 */

import { ParcelStatus, ParcelPriority } from './delivery-history.model';

/**
 * Zone Statistics with detailed breakdown
 */
export interface ZoneStatsDTO {
  zoneId: string;
  zoneName: string;
  postalCode: string;
  totalParcels: number;
  totalWeight: number;
  inTransitParcels: number;
  deliveredParcels: number;
  unassignedParcels: number;
  totalDeliveryPersons: number;
  parcelsByStatus: { [key: string]: number };
}

/**
 * Delivery Person Statistics with performance metrics
 */
export interface DeliveryPersonStatisticsDTO {
  deliveryPersonId: string;
  deliveryPersonName: string;
  email: string;
  phone: string;
  zoneName?: string;
  zoneId?: string;
  totalParcels: number;
  totalWeight: number;
  deliveredParcels: number;
  inTransitParcels: number;
  pendingParcels: number;
  successRate: number;
  parcelsByStatus: { [key: string]: number };
}

/**
 * Parcel search filters for advanced search
 */
export interface ParcelSearchFilters {
  status?: ParcelStatus;
  priority?: ParcelPriority;
  zoneId?: string;
  destinationCity?: string;
  deliveryPersonId?: string;
  senderClientId?: string;
  recipientId?: string;
  unassignedOnly?: boolean;
}

/**
 * Pageable request parameters
 */
export interface PageableRequest {
  page: number;
  size: number;
  sort?: string; // e.g., "createdAt,desc"
}

/**
 * Pageable response wrapper
 */
export interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Chart data for visualizations
 */
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

/**
 * Dashboard KPI Card data
 */
export interface KPICard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  route?: string;
}
