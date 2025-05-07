// src/routes/DashboardRouter.jsx
import { Navigate } from "react-router-dom";
import DashboardStudent from "../pages/DashboardStudent";
import DashboardHostelAdmin from "../pages/DashboardHostelAdmin";
import DashboardTUSC from "../pages/DashboardTUSC";
import DashboardDSW from "../pages/DashboardDSW";

const DashboardRouter = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case "student":
      return <DashboardStudent />;
    case "hostel_admin":
      return <DashboardHostelAdmin />;
    case "tusc":
      return <DashboardTUSC />;
    case "dsw":
      return <DashboardDSW />;
    default:
      return <Navigate to="/login" />;
  }
};

export default DashboardRouter;
