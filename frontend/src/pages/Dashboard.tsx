import React, { useState } from 'react';
import { useAuth } from '../components/Auth/AuthContext';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [newHabitName, setNewHabitName] = useState('');
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      console.log('Adding habit:', newHabitName);
      setNewHabitName('');
    }
  };

  return (
    <div>
      <h1>Dashboard - Week View</h1>
      <button onClick={logout}>Logout</button>
      <div style={{ margin: '20px 0' }}>
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="Enter habit name"
        />
        <button onClick={handleAddHabit}>Add Habit</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {daysOfWeek.map((day) => (
          <div key={day} style={{ border: '1px solid #ccc', padding: '10px' }}>
            <h3>{day}</h3>
            <p>No habits yet</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;