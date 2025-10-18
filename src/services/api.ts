import axios from 'axios';
import { AuthResponse, LoginRequest, User, ProductsResponse, DeleteProductResponse } from '../types';

const BASE_URL = 'https://dummyjson.com';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    console.log('🔍 Attempting login with:', credentials);
    
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Login response:', data);
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getAllProducts: async (): Promise<ProductsResponse> => {
    const response = await api.get('/products?limit=100');
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    try {
      const response = await api.get('/products/categories');
      console.log('Categories response:', response.data);
      
      // Check if it's an array of strings or objects
      if (Array.isArray(response.data)) {
        // If it's objects with 'name' property, extract names
        if (response.data.length > 0 && typeof response.data[0] === 'object') {
          return response.data.map((cat: any) => cat.name || cat.slug || cat);
        }
        // If it's already strings, return as is
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return some default categories
      return ['beauty', 'fragrances', 'furniture', 'groceries'];
    }
  },

  getProductsByCategory: async (category: string): Promise<ProductsResponse> => {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<DeleteProductResponse> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};