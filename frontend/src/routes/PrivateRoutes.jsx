// PrivateRoutes.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

const PrivateRoutes = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Redirect to respective dashboard based on role
  if (location.pathname === "/dashboard") {
    switch (user.role) {
      case "student":
        return <Navigate to="/dashboard/student" />;
      case "hostel_admin":
        return <Navigate to="/dashboard/hostel-admin" />;
      case "tusc":
        return <Navigate to="/dashboard/tusc" />;
      case "dsw":
        return <Navigate to="/dashboard/dsw" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  return <Outlet />;
};

export default PrivateRoutes;
