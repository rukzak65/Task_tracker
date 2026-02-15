import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/';

interface LoginData {
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
}

export default new AuthService();