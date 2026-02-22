import axios from 'axios';
import AuthService from './auth';

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface Habit {
  id: string;
  title: string;
  day_of_week: number;
  userId: string;
  completions: { [date: string]: boolean }; // date in YYYY-MM-DD format
}

interface CreateHabitData {
  title: string;
  day_of_week: number; // 0-6 for Monday to Sunday
}

class HabitsService {
  private getAuthHeaders() {
    const token = AuthService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getHabits(): Promise<Habit[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/habits/`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch {
      throw new Error('Failed to fetch habits');
    }
  }

  async createHabit(data: CreateHabitData): Promise<Habit> {
    try {
      const response = await axios.post(`${API_BASE_URL}/habits/`, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch{
      throw new Error('Failed to create habit');
    }
  }

  async updateHabit(id: string, data: Partial<Habit>): Promise<Habit> {
    try {
      const response = await axios.put(`${API_BASE_URL}/habits/${id}/`, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch {
      throw new Error('Failed to update habit');
    }
  }

  async deleteHabit(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/habits/${id}/`, {
        headers: this.getAuthHeaders(),
      });
    } catch {
      throw new Error('Failed to delete habit');
    }
  }
}

export default new HabitsService();