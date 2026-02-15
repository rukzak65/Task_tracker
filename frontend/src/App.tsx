import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div>
            <h1>Habit Tracker</h1>
            <p>Hello World!</p>
          </div>
        } />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;