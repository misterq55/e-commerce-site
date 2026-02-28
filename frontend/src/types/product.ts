export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  images: string[];
  continents: number;
  sold: number;
  views: number;
  writer: number;
  cart: number[];
  history: number[];
}

export interface Continent {
  _id: number;
  name: string;
}

export interface Price {
  _id: number;
  name: string;
  array: number[];
}

export interface Filters {
  continents: number[];
  prices: number[];
}

export interface FetchProductsParams {
  skip: number;
  limit: number;
  loadMore?: boolean;
  filters?: Partial<Filters>;
  searchTerm?: string;
}

export type CartProduct = Product & { quantity: number }
