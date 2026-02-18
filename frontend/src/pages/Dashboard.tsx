import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/Auth/AuthContext';
import HabitsService, { Habit } from '../services/habits';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [newHabitName, setNewHabitName] = useState('');
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const loadHabits = async () => {
      try {
        const fetchedHabits = await HabitsService.getHabits();
        setHabits(fetchedHabits);
      } catch (error) {
        console.error('Failed to load habits:', error);
      }
    };
    loadHabits();
  }, []);

  const handleToggleCompletion = async (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const newCompletions = { ...habit.completions, [date]: !habit.completions[date] };
    const updatedHabit = { ...habit, completions: newCompletions };

    // Optimistic update
    setHabits(habits.map(h => h.id === habitId ? updatedHabit : h));

    try {
      await HabitsService.updateHabit(habitId, { completions: newCompletions });
    } catch (error) {
      console.error('Failed to update habit:', error);
      // Revert on error
      setHabits(habits.map(h => h.id === habitId ? habit : h));
    }
  const handleAddHabit = async () => {
    if (newHabitName.trim()) {
      try {
        const newHabit = await HabitsService.createHabit({ name: newHabitName });
        setHabits([...habits, newHabit]);
        setNewHabitName('');
      } catch (error) {
        console.error('Failed to add habit:', error);
      }
    }
  };

  // Get current week's dates (Monday to Sunday)
  const getWeekDates = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
        {daysOfWeek.map((day, index) => (
          <div key={day} style={{ border: '1px solid #ccc', padding: '10px' }}>
            <h3>{day} ({weekDates[index]})</h3>
            {habits.length === 0 ? (
              <p>No habits yet</p>
            ) : (
              habits.map((habit) => (
                <div key={habit.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={habit.completions[weekDates[index]] || false}
                      onChange={() => handleToggleCompletion(habit.id, weekDates[index])}
                    />
                    {habit.name}
                  </label>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;