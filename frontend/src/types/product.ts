export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  images: string[];
  continents: number;
  sold: number;
  views: number;
}

export interface Filters {
  continents: number[];
  price: number[];
}

export interface FetchProductsParams {
  skip: number;
  limit: number;
  loadMore?: boolean;
  filters?: Partial<Filters>;
  searchTerm?: string;
}
