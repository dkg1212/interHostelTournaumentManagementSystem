import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Dashboard Router (handles /dashboard routes)
import DashboardRouter from "./routes/DashboardRouter";

// Special Routes
import EditEventScore from "./pages/EditEventsScore";
import Participants from "./pages/Participants"; // ✅ Import Participants page
import ProfilePage from "./components/ProfilePage"; // Add Profile page route
import RegisterStudentPage from './pages/RegisterStudentPage';
import ApprovedEvents from "./pages/ApprovedEvents";
import EventResultReview from "./pages/EventResultReview";
import AddTeamPage from "./pages/AddTeamPage";
import NotificationPage from "./pages/NotificationpPage"
import Results from "./pages/Results";

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
        <Route path="/results" element={<Results />} />

        {/* Dashboard Routes (Private) */}
        <Route path="/dashboard/*" element={<DashboardRouter />} />

        {/* Profile Page */}
        <Route path="/profile" element={<ProfilePage />} /> {/* Add Profile route */}
        <Route path="/register-student" element={<RegisterStudentPage />} />
        <Route path="/student/events" element={<ApprovedEvents />} />
       <Route path="/event-result-review/:eventId" element={<EventResultReview />} />
      <Route path="/add-team" element={<AddTeamPage />} /> {/* Route for Add Team */}
      <Route path="/notifications" element={<NotificationPage />} />


        {/* Edit Event Score Page */}
        <Route path="/edit-score/:id" element={<EditEventScore />} />

        {/* Manage Participants Page */}
        <Route path="/participants" element={<Participants />} />
      </Routes>
    </Router>
  );
}

export default App;
