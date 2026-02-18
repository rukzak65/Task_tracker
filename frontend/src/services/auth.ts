import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

class AuthService {
  async login(data: LoginData): Promise<void> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
      const { token } = response.data;
      localStorage.setItem('authToken', token);
    } catch {
      throw new Error('Login failed');
    }
  }

  async register(data: RegisterData): Promise<void> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
      const { token } = response.data;
      localStorage.setItem('authToken', token);
    } catch {
      throw new Error('Registration failed');
    }
  }
}

export default new AuthService();