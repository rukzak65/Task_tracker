import React from 'react';

const Dashboard: React.FC = () => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div>
      <h1>Dashboard - Week View</h1>
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