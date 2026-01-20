export enum ParcelStatus {
  CREATED = 'CREATED',
  COLLECTED = 'COLLECTED',
  IN_STOCK = 'IN_STOCK',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED'
}

export enum ParcelPriority {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
  EXPRESS = 'EXPRESS'
}

export interface DeliveryHistory {
  id: string;
  parcelId: string;
  status: ParcelStatus;
  statusDisplay: string;
  changedAt: string;
  formattedChangedAt: string;
  comment?: string;
  hasComment: boolean;
  summary: string;
  detailedSummary: string;
}

/**
 * Parcel Response DTO - matches backend ParcelResponseDTO
 */
export interface Parcel {
  id: string;
  description: string;
  weight: number;
  formattedWeight: string;
  status: ParcelStatus;
  statusDisplay: string;
  priority: ParcelPriority;
  priorityDisplay: string;
  destinationCity: string;
  createdAt: string;

  // Relation IDs and Names (flat structure from backend)
  senderClientId: string;
  senderClientName: string;
  recipientId: string;
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  recipientAddress?: string;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  zoneId?: string;
  zoneName?: string;

  // Products summary
  totalValue?: number;
  formattedTotalValue?: string;
  productCount?: number;

  // Computed flags from backend
  isDelivered: boolean;
  isInProgress: boolean;
  isHighPriority: boolean;
  isAssignedToDeliveryPerson: boolean;
}

export interface ParcelFilters {
  status?: ParcelStatus;
  priority?: ParcelPriority;
  startDate?: string;
  endDate?: string;
  city?: string;
  searchTerm?: string;
}

/**
 * DTO for creating a new parcel - matches backend ParcelCreateDTO
 */
export interface ParcelCreate {
  description?: string;
  weight: number;
  priority: ParcelPriority;
  destinationCity: string;
  senderClientId: string;
  recipientId: string;
  products: ParcelProductItem[];
}

/**
 * Product item in a parcel - matches backend ParcelProductItemDTO
 */
export interface ParcelProductItem {
  productId: string;
  quantity: number;
  price: number;
}
