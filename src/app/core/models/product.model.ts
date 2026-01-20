export interface Product {
  id: string;
  name: string;
  category?: string;
  hasCategory: boolean;
  weight: number;
  formattedWeight: string;
  price: number;
  formattedPrice: string;
}

export interface ProductCreate {
  name: string;
  category?: string;
  weight: number;
  price: number;
}