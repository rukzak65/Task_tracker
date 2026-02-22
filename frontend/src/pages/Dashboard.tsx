import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/Auth/AuthContextInstance';
import HabitsService, { type Habit } from '../services/habits';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [newHabitNames, setNewHabitNames] = useState<string[]>(['', '', '', '', '', '', '']);
  const [habits, setHabits] = useState<Habit[]>([]);

  const dayColors = [
    { bg: '#FEF3C7', border: '#FCD34D' },  // Monday - yellow
    { bg: '#FCE7F3', border: '#FBCFE8' },  // Tuesday - pink
    { bg: '#E0E7FF', border: '#C7D2FE' },  // Wednesday - blue
    { bg: '#FED7AA', border: '#FDBA74' },  // Thursday - orange
    { bg: '#DBEAFE', border: '#BFDBFE' },  // Friday - light blue
    { bg: '#F3E8FF', border: '#E9D5FF' },  // Saturday - purple
    { bg: '#FCE7F3', border: '#FBCFE8' },  // Sunday - pink
  ];

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
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="logo-title">
            <div className="checkmark-logo">✓</div>
            <h1>Habit Tracker</h1>
          </div>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>
      <div className="week-grid">
        {daysOfWeek.map((day, index) => (
          <div 
            key={day} 
            className="day-card"
            style={{ backgroundColor: dayColors[index].bg, borderColor: dayColors[index].border }}
          >
            <h2 className="day-title">{day}</h2>
            <div className="day-form">
              <input
                type="text"
                value={newHabitNames[index]}
                onChange={(e) => setNewHabitNames(prev => prev.map((name, i) => i === index ? e.target.value : name))}
                placeholder="Add habit"
                className="habit-input"
              />
              <button onClick={() => handleAddHabit(index)} className="add-btn">+</button>
            </div>
            <div className="habits-list">
              {habits.filter(h => h.day_of_week === index).length === 0 ? (
                <p className="no-habits">No habits</p>
              ) : (
                habits.filter(h => h.day_of_week === index).map((habit) => (
                  <div key={habit.id} className="habit-item">
                    <label className="habit-label">
                      <input
                        type="checkbox"
                        checked={habit.completions[weekDates[index]] || false}
                        onChange={() => handleToggleCompletion(habit.id, weekDates[index])}
                      />
                      <span>{habit.title}</span>
                    </label>
                    <button onClick={() => handleDeleteHabit(habit.id)} className="delete-btn">×</button>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;