/**
 * Delivery Person Response DTO - matches backend DeliveryPersonResponseDTO
 */
export interface DeliveryPerson {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  vehicle?: string;
  hasVehicle: boolean;
  assignedZoneId?: string;
  assignedZoneName?: string;
  hasAssignedZone: boolean;
}

/**
 * Delivery Person Create DTO
 */
export interface DeliveryPersonCreate {
  firstName: string;
  lastName: string;
  phone: string;
  vehicle?: string;
  assignedZoneId?: string;
}

/**
 * Delivery Person Update DTO - matches backend DeliveryPersonUpdateDTO
 * Note: firstName, lastName, and phone are required by backend validation
 */
export interface DeliveryPersonUpdate {
  firstName: string;
  lastName: string;
  phone: string;
  vehicle?: string;
  assignedZoneId?: string;
}

/**
 * Delivery Person Statistics DTO - matches backend DeliveryPersonStatsDTO
 */
export interface DeliveryPersonStats {
  deliveryPersonId: string;
  deliveryPersonName: string;
  totalParcels: number;
  totalWeight: number;
  activeParcels: number;
  deliveredParcels: number;
  inTransitParcels: number;
  // Monthly statistics
  deliveredThisMonth: number;
  totalThisMonth: number;
  // Success rate (percentage)
  successRate: number;
  // Average deliveries per day this month
  avgDeliveriesPerDay: number;
  // Additional status counts
  collectedParcels: number;
  inStockParcels: number;
}
