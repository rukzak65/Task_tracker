import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/Auth/AuthContextInstance';
import HabitsService, { type Habit } from '../services/habits';
import './Dashboard.css';

type CompletionMap = Record<string, number>;

const getCompletionKey = (habitId: string | number, dayOfWeek: number): string => `${habitId}-${dayOfWeek}`;
const COMPLETIONS_CACHE_KEY = 'habitCompletionByKey';

const readCachedCompletions = (): CompletionMap => {
  try {
    const cached = localStorage.getItem(COMPLETIONS_CACHE_KEY);
    if (!cached) return {};
    const parsed = JSON.parse(cached) as CompletionMap;
    return parsed ?? {};
  } catch {
    return {};
  }
};

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [newHabitNames, setNewHabitNames] = useState<string[]>(['', '', '', '', '', '', '']);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completionByKey, setCompletionByKey] = useState<CompletionMap>(readCachedCompletions);
  const [pendingCompletionKeys, setPendingCompletionKeys] = useState<Record<string, boolean>>({});

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
    const loadDashboardData = async () => {
      try {
        const [fetchedHabits, fetchedCompletions] = await Promise.all([
          HabitsService.getHabits(),
          HabitsService.getAllCompletions(),
        ]);

        setHabits(fetchedHabits.map(h => ({ ...h, completions: h.completions || {} })));

        const completionMap = fetchedCompletions.reduce<CompletionMap>((acc, completion) => {
          acc[getCompletionKey(completion.habit_id, completion.day_of_week)] = completion.id;
          return acc;
        }, {});

        setCompletionByKey(completionMap);
      } catch (error) {
        console.error('Failed to load dashboard data, using cached completions:', error);
      }
    };
    loadDashboardData();
  }, []);

  useEffect(() => {
    localStorage.setItem(COMPLETIONS_CACHE_KEY, JSON.stringify(completionByKey));
  }, [completionByKey]);

  const handleToggleCompletion = async (habitId: string | number, dayOfWeek: number) => {
    const completionKey = getCompletionKey(habitId, dayOfWeek);
    if (pendingCompletionKeys[completionKey]) return;

    const existingCompletionId = completionByKey[completionKey];
    setPendingCompletionKeys(prev => ({ ...prev, [completionKey]: true }));

    if (existingCompletionId) {
      setCompletionByKey(prev => {
        const updated = { ...prev };
        delete updated[completionKey];
        return updated;
      });

      try {
        await HabitsService.deleteCompletion(existingCompletionId);
      } catch (error) {
        setCompletionByKey(prev => ({ ...prev, [completionKey]: existingCompletionId }));
        console.error('Failed to delete completion:', error);
      } finally {
        setPendingCompletionKeys(prev => {
          const updated = { ...prev };
          delete updated[completionKey];
          return updated;
        });
      }
      return;
    }

    setCompletionByKey(prev => ({ ...prev, [completionKey]: -1 }));

    try {
      const createdCompletion = await HabitsService.createCompletion({
        habit_id: Number(habitId),
        day_of_week: dayOfWeek,
      });

      setCompletionByKey(prev => ({ ...prev, [completionKey]: createdCompletion.id }));
    } catch (error) {
      setCompletionByKey(prev => {
        const updated = { ...prev };
        delete updated[completionKey];
        return updated;
      });
      console.error('Failed to create completion:', error);
    } finally {
      setPendingCompletionKeys(prev => {
        const updated = { ...prev };
        delete updated[completionKey];
        return updated;
      });
    }
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

  const handleDeleteHabit = async (habitId: string | number) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await HabitsService.deleteHabit(habitId);
        setHabits(habits.filter(h => h.id !== habitId));
        setCompletionByKey(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach((key) => {
            if (key.startsWith(`${habitId}-`)) {
              delete updated[key];
            }
          });
          return updated;
        });
      } catch (error) {
        console.error('Failed to delete habit:', error);
      }
    }
  };
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
                        checked={Boolean(completionByKey[getCompletionKey(habit.id, index)])}
                        disabled={Boolean(pendingCompletionKeys[getCompletionKey(habit.id, index)])}
                        onChange={() => handleToggleCompletion(habit.id, index)}
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