import axios from 'axios';
import { supabase } from '../config/supabase.js';

const API_URL = 'http://localhost:5001/api';

// Test data
const testUser = {
  email: `test${Date.now()}@example.com`, // Unique email for each test run
  password: 'testpassword123',
  name: 'Test User'
};

let authToken = '';
let userId = '';

describe('API Tests', () => {
  // Clean up test data after all tests
  afterAll(async () => {
    if (userId) {
      await supabase.from('users').delete().eq('id', userId);
    }
  });

  // Test registration
  test('Register new user', async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, testUser);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('session');
      userId = response.data.user.id;
      authToken = response.data.session.access_token;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test login
  test('Login user', async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('session');
      authToken = response.data.session.access_token;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test get products
  test('Get all products', async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    } catch (error) {
      console.error('Get products error:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test get single product
  test('Get single product', async () => {
    try {
      const products = await axios.get(`${API_URL}/products`);
      const productId = products.data[0].id;
      const response = await axios.get(`${API_URL}/products/${productId}`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', productId);
    } catch (error) {
      console.error('Get single product error:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test create order
  test('Create order', async () => {
    try {
      const products = await axios.get(`${API_URL}/products`);
      const orderData = {
        items: [
          {
            id: products.data[0].id,
            quantity: 2,
            price: products.data[0].price
          }
        ],
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        },
        paymentMethod: 'credit_card'
      };

      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
    } catch (error) {
      console.error('Create order error:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test get user orders
  test('Get user orders', async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/myorders`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    } catch (error) {
      console.error('Get user orders error:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test logout
  test('Logout user', async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message');
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
      throw error;
    }
  });
}); 