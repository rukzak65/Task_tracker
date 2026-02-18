import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/Auth/AuthContextInstance';
import HabitsService, { type Habit } from '../services/habits';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [newHabitNames, setNewHabitNames] = useState<string[]>(['', '', '', '', '', '', '']);
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const loadHabits = async () => {
      try {
        const fetchedHabits = await HabitsService.getHabits();
        setHabits(fetchedHabits.map(h => ({ ...h, completions: h.completions || {} })));
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

    // Note: Completions are local only, no API update needed
  };

  const handleAddHabit = async (dayIndex: number) => {
    if (!newHabitNames[dayIndex].trim()) return;
    try {
      const newHabit = await HabitsService.createHabit({ title: newHabitNames[dayIndex], day_of_week: dayIndex });
      const updatedHabit = { ...newHabit, completions: {} };
      setHabits([...habits, updatedHabit]);
      setNewHabitNames(prev => prev.map((name, i) => i === dayIndex ? '' : name));
    } catch (error) {
      console.error('Failed to create habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await HabitsService.deleteHabit(habitId);
        setHabits(habits.filter(h => h.id !== habitId));
      } catch (error) {
        console.error('Failed to delete habit:', error);
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {daysOfWeek.map((day, index) => (
          <div key={day} style={{ border: '1px solid #ccc', padding: '10px' }}>
            <h3>{day}</h3>
            <div style={{ margin: '10px 0' }}>
              <input
                type="text"
                value={newHabitNames[index]}
                onChange={(e) => setNewHabitNames(prev => prev.map((name, i) => i === index ? e.target.value : name))}
                placeholder="Enter habit name"
              />
              <button onClick={() => handleAddHabit(index)}>Add Habit</button>
            </div>
            {habits.length === 0 ? (
              <p>No habits yet</p>
            ) : (
              habits.filter(h => h.day_of_week === index).map((habit) => (
                <div key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={habit.completions[weekDates[index]] || false}
                      onChange={() => handleToggleCompletion(habit.id, weekDates[index])}
                    />
                    {habit.title}
                  </label>
                  <button onClick={() => handleDeleteHabit(habit.id)}>Delete</button>
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