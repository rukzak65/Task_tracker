import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div>
            <h1>Habit Tracker</h1>
            <p>Hello World!</p>
            <Link to="/login">Go to Login</Link>
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;