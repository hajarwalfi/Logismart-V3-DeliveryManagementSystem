/**
 * Zone Response DTO - matches backend ZoneResponseDTO
 */
export interface Zone {
  id: string;
  name: string;
  postalCode: string;
}

/**
 * Zone Create DTO
 */
export interface ZoneCreate {
  name: string;
  postalCode: string;
}

/**
 * Zone Update DTO
 */
export interface ZoneUpdate {
  id: string;
  name?: string;
  postalCode?: string;
}

/**
 * Zone Statistics DTO
 */
export interface ZoneStats {
  zoneId: string;
  zoneName: string;
  totalParcels: number;
  deliveredParcels: number;
  inTransitParcels: number;
  pendingParcels: number;
  totalDeliveryPersons: number;
  availableDeliveryPersons: number;
}
