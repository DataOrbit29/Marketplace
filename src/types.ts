export type Category = 
  | 'All'
  | 'Electronics'
  | 'Furniture'
  | 'Clothing'
  | 'Vehicles'
  | 'Books'
  | 'Toys & Games'
  | 'Sports & Outdoors'
  | 'Other';

export type Condition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';

export interface Listing {
  id: string;
  name: string;
  category: string;
  price: number;
  condition: Condition | string;
  description: string;
  imageBase64: string;
  createdAt: any; // Firebase Timestamp or Date/Number
  sellerId: string;
  isUploading?: boolean; // Temporary upload/processing indicator
}

export interface NewListingFormData {
  name: string;
  category: string;
  price: number | '';
  condition: Condition;
  description: string;
  imageBase64: string;
  sellerId: string;
}
