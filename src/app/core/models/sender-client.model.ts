/**
 * Sender Client Response DTO - matches backend SenderClientResponseDTO
 */
export interface SenderClient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

/**
 * Sender Client Create DTO
 */
export interface SenderClientCreate {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

/**
 * Sender Client Update DTO
 */
export interface SenderClientUpdate {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
}
