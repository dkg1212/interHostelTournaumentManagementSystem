// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DashboardRouter from "./routes/DashboardRouter"; // Import DashboardRouter
import EditEventScore from "./pages/EditEventsScore";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Private Routes */}
        {/* Dashboard Routes, all dashboard related pages are nested under this route */}
        <Route path="/dashboard/*" element={<DashboardRouter />} />

        {/* Specific Event Score Edit Route */}
        <Route path="/edit-score/:id" element={<EditEventScore />} />
      </Routes>
    </Router>
  );
}

export default App;
