export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token?: string;
  accessToken?: string; // DummyJSON uses accessToken
  refreshToken: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  isDeleted?: boolean;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface DeleteProductResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  isDeleted: boolean;
  deletedOn: string;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Category: { category: string };
};

export type MainTabParamList = {
  Products: undefined;
  AutoLockTest: undefined;
  Logout: undefined;
};