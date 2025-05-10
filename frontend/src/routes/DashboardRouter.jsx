// src/routes/DashboardRouter.jsx
import { Navigate } from "react-router-dom";
import DashboardStudent from "../pages/DashboardStudent";
import DashboardHostelAdmin from "../pages/DashboardHostelAdmin";
import DashboardTUSC from "../pages/DashboardTUSC";
import DashboardDSW from "../pages/DashboardDSW";

const DashboardRouter = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/login" />;

  const roleBasedRoutes = {
    student: <DashboardStudent />,
    hostel_admin: <DashboardHostelAdmin />,
    tusc: <DashboardTUSC />,
    dsw: <DashboardDSW />,
  };

  return roleBasedRoutes[user.role] || <Navigate to="/login" />;
};

export default DashboardRouter;
