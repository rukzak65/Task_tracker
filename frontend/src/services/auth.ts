import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface DecodedToken {
  userId: string;
  email: string;
  exp: number;
}

class AuthService {
  private tokenKey = 'authToken';

  async login(data: LoginData): Promise<void> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
      const { access_token } = response.data;
      localStorage.setItem(this.tokenKey, access_token);
    } catch (error) {
      throw new Error('Login failed');
    }
  }

  async register(data: RegisterData): Promise<void> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
      const { access_token } = response.data;
      localStorage.setItem(this.tokenKey, access_token);
    } catch {
      throw new Error('Registration failed');
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.userId;
    } catch {
      return null;
    }
  }
}

export default new AuthService();