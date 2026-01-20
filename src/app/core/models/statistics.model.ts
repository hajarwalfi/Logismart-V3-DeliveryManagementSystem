/**
 * Global Statistics DTO - matches backend GlobalStatisticsDTO
 */
export interface GlobalStatistics {
  totalParcels: number;
  totalWeight: number;
  totalZones: number;
  totalDeliveryPersons: number;
  totalSenderClients: number;
  totalRecipients: number;
  totalProducts: number;
  parcelsByStatus: { [key: string]: number };
  parcelsByPriority: { [key: string]: number };
  unassignedParcels: number;
  highPriorityPending: number;
  averageParcelsPerDeliveryPerson: number;
  averageWeight: number;
}

/**
 * Delivery Person Statistics DTO
 */
export interface DeliveryPersonStatistics {
  deliveryPersonId: string;
  deliveryPersonName: string;
  zoneName?: string;
  totalParcels: number;
  deliveredParcels: number;
  inTransitParcels: number;
  pendingParcels: number;
  successRate?: number;
}

/**
 * Zone Statistics DTO
 */
export interface ZoneStatistics {
  zoneId: string;
  zoneName: string;
  totalParcels: number;
  deliveredParcels: number;
  inTransitParcels: number;
  pendingParcels: number;
  totalDeliveryPersons: number;
  availableDeliveryPersons: number;
}
